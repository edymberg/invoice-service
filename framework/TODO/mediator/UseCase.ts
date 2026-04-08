export interface UseCase<UseCaseInput, UseCaseOutput> {
  execute(input: UseCaseInput): Promise<UseCaseOutput>;
}

export type UseCaseInput<I> = {} & I;
export type UseCaseOutput<O> = {} & O;
