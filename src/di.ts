import { Swagger } from "../framework/http";
import { PinoLoggerFactory } from "../framework/logging";
import { MaskedDTO } from "../framework/mediator";
import { GetAfipStatusQuery } from "./business/usecases/GetAfipStatusQuery";
import { GetInvoiceQuery } from "./business/usecases/GetInvoiceQuery";
import { IssueInvoiceUseCaseImpl } from "./business/usecases/IssueInvoiceUseCaseImpl";
import { GetInvoiceHandler } from "./infrastructure/adapters/inbound/handlers/GetInvoiceHandler";
import { IssueInvoiceHandler } from "./infrastructure/adapters/inbound/handlers/IssueInvoiceHandler";
import { AfipController } from "./infrastructure/adapters/inbound/http/controllers/AfipController";
import { HealthController } from "./infrastructure/adapters/inbound/http/controllers/HealthController";
import { InvoiceController } from "./infrastructure/adapters/inbound/http/controllers/InvoiceController";
import { SalesPointsController } from "./infrastructure/adapters/inbound/http/controllers/SalesPointsController";
import { CreateInvoiceRequestDTO } from "./infrastructure/adapters/inbound/http/dtos/CreateInvoiceRequestDTO";
import { CreateInvoiceResponseDTO } from "./infrastructure/adapters/inbound/http/dtos/CreateInvoiceResponseDTO";
import { GetInvoiceRequestDTO } from "./infrastructure/adapters/inbound/http/dtos/GetInvoiceRequestDTO";
import { FromGetInvoiceRequestDTOToGetInvoiceQueryUseCaseInputMapper } from "./infrastructure/adapters/inbound/http/mappers/inbound/FromGetInvoiceRequestDTOToGetInvoiceQueryUseCaseInputMapper";
import { FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper } from "./infrastructure/adapters/inbound/http/mappers/inbound/FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper";
import { FromGetInvoiceQueryToGetInvoiceResponseDTOMapper } from "./infrastructure/adapters/inbound/http/mappers/outbound/FromGetInvoiceQueryToGetInvoiceResponseDTOMapper";
import { FromIssueInvoiceUseCaseOutputToCreateInvoiceResponseDTOMapper } from "./infrastructure/adapters/inbound/http/mappers/outbound/FromIssueInvoiceUseCaseOutputToCreateInvoiceResponseDTOMapper";
import { CreateInvoiceEventInboundDTO } from "./infrastructure/adapters/inbound/messaging/dtos/CreateInvoiceEventInboundDTO";
import { CreateInvoiceEventOutboundDTO } from "./infrastructure/adapters/inbound/messaging/dtos/CreateInvoiceEventOutboundDTO";
import { InvoiceListener } from "./infrastructure/adapters/inbound/messaging/InvoiceListener";
import { FromEventToUseCaseMapper } from "./infrastructure/adapters/inbound/messaging/mappers/inbound/FromEventToUseCaseMapper";
import { FromUseCaseToEventMapper } from "./infrastructure/adapters/inbound/messaging/mappers/outbound/FromUseCaseToEventMapper";
import { IdempotencyStoreMongoAdapter } from "./infrastructure/adapters/outbound/persistance/mongo/IdempotencyStoreMongoAdapter";
import { InvoiceRepositoryMongoAdapter } from "./infrastructure/adapters/outbound/persistance/mongo/InvoiceRepositoryMongoAdapter";
import { MongoClientProvider } from "./infrastructure/adapters/outbound/persistance/mongo/MongoClientProvider";
import { AfipSdkElectronicBillingAdapter } from "./infrastructure/adapters/outbound/sdk/afip/AfipSdkElectronicBillingAdapter";
import { FromCreateVoucherRequestToAFIPCreateNextVoucherDTOMapper } from "./infrastructure/adapters/outbound/sdk/afip/mappers/inbound/FromCreateVoucherRequestToAFIPCreateNextVoucherDTOMapper";
import { FromAFIPCreateNextVoucherToCreateNextVoucherResultDTOMapper } from "./infrastructure/adapters/outbound/sdk/afip/mappers/outbound/FromAFIPCreateNextVoucherToCreateNextVoucherResultDTOMapper";

export async function buildDependencies(): Promise<{
  invoiceController: InvoiceController;
  afipController: AfipController;
  healthController: HealthController;
  salesPointsController: SalesPointsController;
  swagger: Swagger;
}> {
  // Logger
  PinoLoggerFactory.configureLogger(process.env);

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
  const httpIssueInvoiceOutMapper =
    new FromIssueInvoiceUseCaseOutputToCreateInvoiceResponseDTOMapper();
  const httpIssueInvoiceInbMapper = new FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper();
  const httpGetInvoiceOutMapper = new FromGetInvoiceQueryToGetInvoiceResponseDTOMapper();
  const httpGetInvoiceInbMapper = new FromGetInvoiceRequestDTOToGetInvoiceQueryUseCaseInputMapper();

  // Masked DTOs
  const maskedCreateInvoiceRequestDTO = {
    mask: (input: CreateInvoiceRequestDTO) => input,
  } as unknown as MaskedDTO<CreateInvoiceRequestDTO>;
  const maskedCreateInvoiceEventInboundDTO = {
    mask: (input: CreateInvoiceEventInboundDTO) => input,
  } as unknown as MaskedDTO<CreateInvoiceEventInboundDTO>;

  // Handlers
  const httpIssueInvoiceHandler = new IssueInvoiceHandler<
    CreateInvoiceRequestDTO,
    CreateInvoiceResponseDTO
  >(issue, httpIssueInvoiceInbMapper, httpIssueInvoiceOutMapper, maskedCreateInvoiceRequestDTO);
  const eventIssueInvoiceHandler = new IssueInvoiceHandler<
    CreateInvoiceEventInboundDTO,
    CreateInvoiceEventOutboundDTO
  >(
    issue,
    new FromEventToUseCaseMapper(),
    new FromUseCaseToEventMapper(),
    maskedCreateInvoiceEventInboundDTO,
  );
  const httpGetInvoiceHandler = new GetInvoiceHandler(
    getInvoice,
    httpGetInvoiceInbMapper,
    httpGetInvoiceOutMapper,
    null as unknown as MaskedDTO<GetInvoiceRequestDTO>,
  );

  // Controllers
  const invoiceController = new InvoiceController(httpIssueInvoiceHandler, httpGetInvoiceHandler);
  const afipController = new AfipController(afipStatus);
  const healthController = new HealthController();
  const salesPointsController = new SalesPointsController();

  // Listeners
  new InvoiceListener(eventIssueInvoiceHandler);

  // Swagger
  const swagger = new Swagger();

  // Routes
  return {
    invoiceController,
    afipController,
    healthController,
    salesPointsController,
    swagger,
  };
}
