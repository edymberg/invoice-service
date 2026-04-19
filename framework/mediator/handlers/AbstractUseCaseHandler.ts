import { InboundDTO, OutboundDTO } from "./types";
import { UseCaseHandler } from "./UseCaseHandler";
import { MaskedDTO } from "../loggging/MaskedDTO";
import { Mapper } from "../mappers/Mapper";
import { Args } from "../types";
import { UseCaseInput, UseCaseOutput } from "../usecases/types";
import { UseCase } from "../usecases/UseCase";

export abstract class AbstractUseCaseHandler<
  I extends InboundDTO,
  O extends OutboundDTO,
> implements UseCaseHandler<I, O> {
  constructor(
    protected readonly useCase: UseCase<UseCaseInput, UseCaseOutput>,
    // Sabra el Mapper si su input I es un DTO que viene de HTTP, GRPC, Eventos, etc.
    protected readonly inboundMapper: Mapper<I, UseCaseInput>,
    // Sabra el Mapper si su output O es un DTO que va hacia HTTP, GRPC, Eventos, etc.
    protected readonly outboundMapper: Mapper<UseCaseOutput, O>,
    // Sabra el MaskedDTO si su input I es un DTO que viene de HTTP, GRPC, Eventos, etc y que campos deve de enmascarar.
    protected readonly maskedDTO: MaskedDTO<I>,
  ) {}

  protected abstract beforeHandle(input: I, ...args: Args): void;
  protected abstract afterHandle(output: O, ...args: Args): void;

  public async handle(input: I, ...args: Args): Promise<O> {
    this.beforeHandle(input, ...args);

    const useCaseInput: UseCaseInput = this.inboundMapper.map(input, ...args);
    const useCaseOutput: UseCaseOutput = await this.useCase.execute(useCaseInput);
    const output: O = this.outboundMapper.map(useCaseOutput);

    this.afterHandle(output, ...args);
    return output;
  }
}
