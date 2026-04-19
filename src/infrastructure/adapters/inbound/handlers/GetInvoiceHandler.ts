import { PinoLogger, PinoLoggerFactory } from "../../../../../framework/logging";
import { AbstractUseCaseHandler, Args, Mapper, MaskedDTO } from "../../../../../framework/mediator";
import {
  GetInvoiceUseCase,
  GetInvoiceUseCaseInput,
  GetInvoiceUseCaseOutput,
} from "../../../../domain/invoice/usecases/GetInvoice";
import { GetInvoiceRequestDTO } from "../http/dtos/GetInvoiceRequestDTO";
import { GetInvoiceResponseDTO } from "../http/dtos/GetInvoiceResponseDTO";

export class GetInvoiceHandler extends AbstractUseCaseHandler<
  GetInvoiceRequestDTO,
  GetInvoiceResponseDTO
> {
  private readonly logger: PinoLogger = PinoLoggerFactory.getLogger("GetInvoiceHandler");

  constructor(
    protected readonly useCase: GetInvoiceUseCase,
    protected readonly inboundMapper: Mapper<GetInvoiceRequestDTO, GetInvoiceUseCaseInput>,
    protected readonly outboundMapper: Mapper<GetInvoiceUseCaseOutput, GetInvoiceResponseDTO>,
    protected readonly maskedDTO: MaskedDTO<GetInvoiceRequestDTO>,
  ) {
    super(useCase, inboundMapper, outboundMapper, maskedDTO);
  }

  protected beforeHandle(input: GetInvoiceRequestDTO, ..._args: Args): void {
    this.logger.debug(`Handling get invoice request: ${this.maskedDTO.mask(input)}`);
  }

  protected afterHandle(output: GetInvoiceResponseDTO, ..._args: Args): void {
    this.logger.debug(`Get invoice request handled successfully: ${JSON.stringify(output)}`);
  }
}
