// TODO: review if this is the best approach
// export type Args = any[];

export interface Mapper<Inbound, Outbound> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map(input: Inbound, ...args: any[]): Outbound;
}
