import { PinoLogger, PinoLoggerFactory } from "../../../../../framework/logging";
import { AbstractUseCaseHandler, Args, Mapper, MaskedDTO } from "../../../../../framework/mediator";
import {
  IssueInvoiceUseCaseInput,
  IssueInvoiceUseCaseOutput,
  IssueInvoiceUseCase,
} from "../../../../domain/invoice/usecases/IssueInvoice";
import { CreateInvoiceRequestDTO } from "../http/dtos/CreateInvoiceRequestDTO";
import { CreateInvoiceResponseDTO } from "../http/dtos/CreateInvoiceResponseDTO";

export class IssueInvoiceHandler extends AbstractUseCaseHandler<
  CreateInvoiceRequestDTO,
  CreateInvoiceResponseDTO
> {
  private readonly logger: PinoLogger = PinoLoggerFactory.getLogger("IssueInvoiceHandler");

  constructor(
    protected readonly useCase: IssueInvoiceUseCase,
    protected readonly inboundMapper: Mapper<CreateInvoiceRequestDTO, IssueInvoiceUseCaseInput>,
    protected readonly outboundMapper: Mapper<IssueInvoiceUseCaseOutput, CreateInvoiceResponseDTO>,
    protected readonly maskedDTO: MaskedDTO<CreateInvoiceRequestDTO>,
  ) {
    super(useCase, inboundMapper, outboundMapper, maskedDTO);
  }

  protected beforeHandle(input: CreateInvoiceRequestDTO, ..._args: Args): void {
    this.logger.debug(`Handling issue invoice request: ${this.maskedDTO.mask(input)}`);
  }

  protected afterHandle(output: CreateInvoiceResponseDTO, ..._args: Args): void {
    this.logger.debug(`Output: ${JSON.stringify(output)}`);
  }
}
