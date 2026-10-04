export enum Currency {
  ARS = "ARS",
  USD = "USD",
}
export class Money {
  public readonly amount: number;
  public readonly currency: Currency;

  private constructor(amount: number, currency: Currency) {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid amount");
    }
    this.amount = Number(amount.toFixed(2));
    this.currency = currency;
  }

  // TODO: REMOVE
  public static fromTotal(amount: number): Money {
    if (!Number.isFinite(amount) || amount <= 0) {
      throw new Error("Invalid amount");
    }
    return new Money(Number(amount.toFixed(2)), Currency.ARS);
  }

  public static builder(): MoneyFactoryI {
    return new Money.Factory();
  }

  private static Factory = class MoneyFactory implements MoneyFactoryI {
    private fieldsMap: Record<string, number | Currency> = {};

    build(): Money {
      return new Money(this.fieldsMap.amount as number, this.fieldsMap.currency as Currency);
    }

    amount(amount: number): MoneyFactoryI {
      this.fieldsMap.amount = amount;
      return this;
    }

    currency(currency: Currency): MoneyFactoryI {
      this.fieldsMap.currency = currency;
      return this;
    }
  }
}

interface MoneyFactoryI {
  build(): Money;
  amount(amount: number): MoneyFactoryI;
  currency(currency: Currency): MoneyFactoryI;
}
