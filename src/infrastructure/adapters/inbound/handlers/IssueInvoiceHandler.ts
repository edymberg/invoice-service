import { IssueInvoiceUseCase, IssueInvoiceUseCaseInput, IssueInvoiceUseCaseOutput } from "../../../../domain/invoice/usecases/IssueInvoice";
import { UseCaseHandler } from "../../../../../framework/UseCaseHandler";
import { Mapper } from "../../../../../framework/Mapper";
import { MaskedDTO } from "../../../../../framework/MaskedDTO";

export class IssueInvoiceHandler<I, O> implements UseCaseHandler<I, O> {
	// TODO: private static readonly Logger logger = LoggerFactory.getLogger(CreateExampleHandler.class);
	constructor(
		private readonly useCase: IssueInvoiceUseCase,
		private readonly inboundMapper: Mapper<I, IssueInvoiceUseCaseInput>,
		private readonly outboundMapper: Mapper<IssueInvoiceUseCaseOutput, O>,
		private readonly maskedDTO: MaskedDTO<I>,
	) {}

  // TODO: review mappers
	async handle(input: I, args?: any): Promise<O> {
		return this.outboundMapper.map(
			await this.useCase.execute(
				this.inboundMapper.map(input, args)
			)
		);
	}
}