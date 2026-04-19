import { Mapper, MaskedDTO, UseCaseHandler } from "../../../../../framework/hexagonal";
import { PinoLogger, PinoLoggerFactory } from "../../../../../framework/logging";
import {
  GetInvoiceUseCase,
  GetInvoiceUseCaseInput,
  GetInvoiceUseCaseOutput,
} from "../../../../domain/invoice/usecases/GetInvoice";

export class GetInvoiceHandler<I, O> implements UseCaseHandler<I, O> {
  private readonly logger: PinoLogger = PinoLoggerFactory.getLogger("GetInvoiceHandler");

  constructor(
    private readonly useCase: GetInvoiceUseCase,
    private readonly inboundMapper: Mapper<I, GetInvoiceUseCaseInput>,
    private readonly outboundMapper: Mapper<GetInvoiceUseCaseOutput, O>,
    private readonly maskedDTO: MaskedDTO<I>,
  ) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async handle(input: I, args?: any): Promise<O> {
    this.logger.debug(`Handling get invoice request: ${this.maskedDTO.mask(input)}`);

    return this.outboundMapper.map(await this.useCase.execute(this.inboundMapper.map(input, args)));
  }
}
