import { PinoLogger, PinoLoggerFactory } from "../../../../../framework/logging";
import {
  AbstractUseCaseHandler,
  Args,
  InboundDTO,
  Mapper,
  MaskedDTO,
  OutboundDTO,
} from "../../../../../framework/mediator";
import {
  IssueInvoiceUseCaseInput,
  IssueInvoiceUseCaseOutput,
  IssueInvoiceUseCase,
} from "../../../../domain/invoice/usecases/IssueInvoice";

export class IssueInvoiceHandler<
  I extends InboundDTO,
  O extends OutboundDTO,
> extends AbstractUseCaseHandler<I, O> {
  private readonly logger: PinoLogger = PinoLoggerFactory.getLogger("IssueInvoiceHandler");

  constructor(
    protected readonly useCase: IssueInvoiceUseCase,
    protected readonly inboundMapper: Mapper<I, IssueInvoiceUseCaseInput>,
    protected readonly outboundMapper: Mapper<IssueInvoiceUseCaseOutput, O>,
    protected readonly maskedDTO: MaskedDTO<I>,
  ) {
    super(useCase, inboundMapper, outboundMapper, maskedDTO);
  }

  protected beforeHandle(input: I, ..._args: Args): void {
    this.logger.debug(`Handling issue invoice request: ${this.maskedDTO.mask(input)}`);
  }

  protected afterHandle(output: O, ..._args: Args): void {
    this.logger.debug(`Output: ${JSON.stringify(output)}`);
  }
}
