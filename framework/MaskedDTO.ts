export interface MaskedDTO<I> {
	mask(input: I): I;
}