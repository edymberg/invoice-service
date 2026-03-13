import { Mapper } from "../../../../../framework/Mapper";
import { MaskedDTO } from "../../../../../framework/MaskedDTO";
import { UseCaseHandler } from "../../../../../framework/UseCaseHandler";
import {
  IssueInvoiceUseCase,
  IssueInvoiceUseCaseInput,
  IssueInvoiceUseCaseOutput,
} from "../../../../domain/invoice/usecases/IssueInvoice";

export class IssueInvoiceHandler<I, O> implements UseCaseHandler<I, O> {
  // TODO: private static readonly Logger logger = LoggerFactory.getLogger(CreateExampleHandler.class);
  constructor(
    private readonly useCase: IssueInvoiceUseCase,
    private readonly inboundMapper: Mapper<I, IssueInvoiceUseCaseInput>,
    private readonly outboundMapper: Mapper<IssueInvoiceUseCaseOutput, O>,
    private readonly maskedDTO: MaskedDTO<I>,
  ) {}

  // TODO: review mappers
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handle(input: I, args?: any): Promise<O> {
    return this.outboundMapper.map(await this.useCase.execute(this.inboundMapper.map(input, args)));
  }
}
