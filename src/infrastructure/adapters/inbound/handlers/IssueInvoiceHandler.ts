import { Mapper, MaskedDTO, UseCaseHandler } from "../../../../../framework/hexagonal";
import { PinoLogger, PinoLoggerFactory } from "../../../../../framework/logging";
import {
  IssueInvoiceUseCase,
  IssueInvoiceUseCaseInput,
  IssueInvoiceUseCaseOutput,
} from "../../../../domain/invoice/usecases/IssueInvoice";

export class IssueInvoiceHandler<I, O> implements UseCaseHandler<I, O> {
  private readonly logger: PinoLogger = PinoLoggerFactory.getLogger("IssueInvoiceHandler");

  constructor(
    private readonly useCase: IssueInvoiceUseCase,
    private readonly inboundMapper: Mapper<I, IssueInvoiceUseCaseInput>,
    private readonly outboundMapper: Mapper<IssueInvoiceUseCaseOutput, O>,
    private readonly maskedDTO: MaskedDTO<I>,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handle(input: I, args?: any): Promise<O> {
    this.logger.debug(`Handling issue invoice request: ${this.maskedDTO.mask(input)}`);

    return this.outboundMapper.map(await this.useCase.execute(this.inboundMapper.map(input, args)));
  }
}
