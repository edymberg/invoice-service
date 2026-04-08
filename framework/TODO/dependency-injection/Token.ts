// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class Token<T> {
  readonly key: symbol;

  constructor(public readonly description: string) {
    this.key = Symbol(description);
  }
}
