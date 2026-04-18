export interface UseCaseHandler<Inbound, Outbound> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handle(input: Inbound, args?: any): Promise<Outbound>;
}
