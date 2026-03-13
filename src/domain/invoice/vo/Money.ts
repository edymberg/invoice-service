enum Currency {
  ARS = "ARS",
  USD = "USD",
}
export class Money {
  private constructor(
    public readonly amount: number,
    public readonly currency: Currency = Currency.ARS,
  ) {}
  static fromTotal(amount: number): Money {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid amount");
    }
    return new Money(Number(amount.toFixed(2)));
  }
}
