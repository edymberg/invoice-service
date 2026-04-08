import { UseCase, UseCaseInput, UseCaseOutput } from "./UseCase";
import { LoggerFactory, Logger } from "../../logging/logger";
import { Mapper } from "../../Mapper";
import { MaskedDTO } from "../../MaskedDTO";
import { UseCaseHandler } from "../../UseCaseHandler";

export type InboundDTO<I> = {} & I;
export type OutboundDTO<O> = {} & O;
// TODO: is this OK? will this handle the case of an arrray of args?
export type Args = Record<string, unknown>;

export abstract class AbstractUseCaseHandler<I, O> implements UseCaseHandler<
  InboundDTO<I>,
  OutboundDTO<O>
> {
  private readonly logger: Logger = LoggerFactory.getLogger("AbstractUseCaseHandler");

  constructor(
    private readonly useCase: UseCase<UseCaseInput<I>, UseCaseOutput<O>>,
    private readonly inboundMapper: Mapper<InboundDTO<I>, UseCaseInput<I>>,
    private readonly outboundMapper: Mapper<UseCaseOutput<O>, OutboundDTO<O>>,
    private readonly maskedDTO: MaskedDTO<InboundDTO<I>>,
  ) {}

  async handle(input: InboundDTO<I>, args?: Args): Promise<OutboundDTO<O>> {
    this.logger.debug(`Input: ${this.maskedDTO.mask(input)}`);
    const output = this.outboundMapper.map(
      await this.useCase.execute(this.inboundMapper.map(input, args)),
    );
    this.logger.debug(`Output: ${this.maskedDTO.mask(input)}`);
    return output;
  }
}
