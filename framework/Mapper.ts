export interface Mapper<I, O> {
	map(input: I, args?: any): O;
}