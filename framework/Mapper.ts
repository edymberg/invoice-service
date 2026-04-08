// TODO: review if this is the best approach
// export type Args = any[];

export interface Mapper<I, O> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map(input: I, ...args: any[]): O;
}
