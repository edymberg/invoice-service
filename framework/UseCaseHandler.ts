export interface UseCaseHandler<I, O> {
	handle(input: I, args?: any): Promise<O>;
}
