export interface UseCaseHandler<I, O> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handle(input: I, args?: any): Promise<O>;
}
