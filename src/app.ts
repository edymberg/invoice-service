import cors from "cors";
import express from "express";

import { MaskedDTO } from "../framework/MaskedDTO";
import { GetAfipStatusQuery } from "./business/usecases/GetAfipStatusQuery";
import { GetInvoiceQuery } from "./business/usecases/GetInvoiceQuery";
import { IssueInvoiceUseCaseImpl } from "./business/usecases/IssueInvoiceUseCaseImpl";
import { IssueInvoiceHandler } from "./infrastructure/adapters/inbound/handlers/IssueInvoiceHandler";
import { AfipController } from "./infrastructure/adapters/inbound/http/controllers/AfipController";
import { HealthController } from "./infrastructure/adapters/inbound/http/controllers/HealthController";
import { InvoiceController } from "./infrastructure/adapters/inbound/http/controllers/InvoiceController";
import { SalesPointsController } from "./infrastructure/adapters/inbound/http/controllers/SalesPointsController";
import { InvoiceRequestDTO } from "./infrastructure/adapters/inbound/http/dtos/InvoiceRequestDTO";
import { FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper } from "./infrastructure/adapters/inbound/http/mappers/inbound/FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper";
import { FromHttpToInvoiceRequestDTOMapper } from "./infrastructure/adapters/inbound/http/mappers/infra/FromHttpToInvoiceRequestDTOMapper";
import { FromIssueInvoiceUseCaseOutputToInvoiceResponseDTOMapper } from "./infrastructure/adapters/inbound/http/mappers/outbound/FromIssueInvoiceUseCaseOutputToInvoiceResponseDTOMapper";
import { buildRouter } from "./infrastructure/adapters/inbound/http/routes";
import { IdempotencyStoreMongoAdapter } from "./infrastructure/adapters/outbound/persistance/mongo/IdempotencyStoreMongoAdapter";
import { InvoiceRepositoryMongoAdapter } from "./infrastructure/adapters/outbound/persistance/mongo/InvoiceRepositoryMongoAdapter";
import { MongoClientProvider } from "./infrastructure/adapters/outbound/persistance/mongo/MongoClientProvider";
import { AfipSdkElectronicBillingAdapter } from "./infrastructure/adapters/outbound/sdk/afip/AfipSdkElectronicBillingAdapter";
import { FromCreateVoucherRequestToAFIPCreateNextVoucherDTOMapper } from "./infrastructure/adapters/outbound/sdk/afip/mappers/inbound/FromCreateVoucherRequestToAFIPCreateNextVoucherDTOMapper";
import { FromAFIPCreateNextVoucherToCreateNextVoucherResultDTOMapper } from "./infrastructure/adapters/outbound/sdk/afip/mappers/outbound/FromAFIPCreateNextVoucherToCreateNextVoucherResultDTOMapper";

export async function buildApp() {
  const app = express();
  app.use(cors());
  app.use(express.json());

  // Mongo DB
  const db = await MongoClientProvider.getOrInitDataBase();

  // Adapters
  const invoiceRepo = new InvoiceRepositoryMongoAdapter(db);
  const idemStore = new IdempotencyStoreMongoAdapter(db);
  const ebillAdapter = new AfipSdkElectronicBillingAdapter(
    new FromCreateVoucherRequestToAFIPCreateNextVoucherDTOMapper(),
    new FromAFIPCreateNextVoucherToCreateNextVoucherResultDTOMapper(),
  );

  // Use cases
  const issue = new IssueInvoiceUseCaseImpl(invoiceRepo, ebillAdapter, idemStore);
  const getInvoice = new GetInvoiceQuery(invoiceRepo);
  const afipStatus = new GetAfipStatusQuery(ebillAdapter);

  // Mappers
  const infraMapper = new FromHttpToInvoiceRequestDTOMapper();
  const outMapper = new FromIssueInvoiceUseCaseOutputToInvoiceResponseDTOMapper();
  const inbMapper = new FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper();

  // Handlers
  const invoiceHandler = new IssueInvoiceHandler(
    issue,
    inbMapper,
    outMapper,
    null as unknown as MaskedDTO<InvoiceRequestDTO>,
  );

  // Controllers
  const invoiceController = new InvoiceController(getInvoice, infraMapper, invoiceHandler);
  const afipController = new AfipController(afipStatus);
  const healthController = new HealthController();
  const salesPointsController = new SalesPointsController();

  // Routes
  app.use(
    buildRouter({ invoiceController, afipController, healthController, salesPointsController }),
  );
  return app;
}
