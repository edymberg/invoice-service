import express from "express";

import { AfipSdkElectronicBillingAdapter } from "./infrastructure/adapters/outbound/sdk/AfipSdkElectronicBillingAdapter";
import { GetAfipStatusQuery } from "./business/usecases/GetAfipStatusQuery";
import { IssueInvoiceUseCaseImpl } from "./business/usecases/IssueInvoiceUseCaseImpl";
import { GetInvoiceQuery } from "./business/usecases/GetInvoiceQuery";
import { SalesPointsController } from "./infrastructure/adapters/inbound/http/controllers/SalesPointsController";
import { InvoiceController } from "./infrastructure/adapters/inbound/http/controllers/InvoiceController";
import { AfipController } from "./infrastructure/adapters/inbound/http/controllers/AfipController";
import { HealthController } from "./infrastructure/adapters/inbound/http/controllers/HealthController";
import { buildRouter } from "./infrastructure/adapters/inbound/http/routes";
import { IdempotencyStoreMongoAdapter } from "./infrastructure/adapters/inbound/persistance/mongo/IdempotencyStoreMongoAdapter";
import { InvoiceRepositoryMongoAdapter } from "./infrastructure/adapters/inbound/persistance/mongo/InvoiceRepositoryMongoAdapter";
import { IssueInvoiceHandler } from "./infrastructure/adapters/inbound/handlers/IssueInvoiceHandler";
import { FromHttpToInvoiceRequestDTOMapper } from "./infrastructure/adapters/inbound/http/mappers/infra/FromHttpToInvoiceRequestDTOMapper";
import { FromInvoiceToInvoiceResponseDTOMapper } from "./infrastructure/adapters/inbound/http/mappers/outbound/FromInvoiceToInvoiceResponseDTOMapper";
import { FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper } from "./infrastructure/adapters/inbound/http/mappers/inbound/FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper";
import { MaskedDTO } from "../framework/MaskedDTO";
import { InvoiceRequestDTO } from "./infrastructure/adapters/inbound/http/dtos/InvoiceRequestDTO";
import { FromAFIPCreateNextVoucherToCreateNextVoucherResultDTOMapper } from "./infrastructure/adapters/outbound/sdk/mappers/outbound/FromAFIPCreateNextVoucherToCreateNextVoucherResultDTOMapper";
import { FromCreateVoucherRequestToAFIPCreateNextVoucherDTOMapper } from "./infrastructure/adapters/outbound/sdk/mappers/inbound/FromCreateVoucherRequestToAFIPCreateNextVoucherDTOMapper";
import { MongoClientProvider } from "./infrastructure/adapters/inbound/persistance/mongo/MongoClientProvider";

export async function buildApp() {
  const app = express();
  app.use(express.json());


  // Mongo DB
  const db = await MongoClientProvider.getOrInitDataBase();

  // Adapters
  const invoiceRepo = new InvoiceRepositoryMongoAdapter(db);
  const idemStore = new IdempotencyStoreMongoAdapter(db);
  const ebillAdapter = new AfipSdkElectronicBillingAdapter(
    new FromCreateVoucherRequestToAFIPCreateNextVoucherDTOMapper(),
    new FromAFIPCreateNextVoucherToCreateNextVoucherResultDTOMapper()
  );

  // Use cases
  const issue = new IssueInvoiceUseCaseImpl(invoiceRepo, ebillAdapter, idemStore);
  const getInvoice = new GetInvoiceQuery(invoiceRepo);
  const afipStatus = new GetAfipStatusQuery(ebillAdapter);

  // Mappers
  const infraMapper = new FromHttpToInvoiceRequestDTOMapper();
  const outMapper = new FromInvoiceToInvoiceResponseDTOMapper();
  const inbMapper = new FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper();

  // Handlers
  const invoiceHandler = new IssueInvoiceHandler(issue, inbMapper, outMapper, null as unknown as MaskedDTO<InvoiceRequestDTO>);

  // Controllers
  const invoiceController = new InvoiceController(getInvoice, infraMapper, invoiceHandler);
  const afipController = new AfipController(afipStatus);
  const healthController = new HealthController();
  const salesPointsController = new SalesPointsController();

  // Routes
  app.use(buildRouter({ invoiceController, afipController, healthController, salesPointsController }));
  return app;
}
