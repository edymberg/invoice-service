import { Money } from "../../../../src/domain/invoice/vo/Money";

describe('Money', () => {
  const aValidAmount = (): number => 100.50;
  const aZeroAmount = (): number => 0;
  const aNegativeAmount = (): number => -50;
  const anInvalidAmount = (): number => NaN;
  const anInfiniteAmount = (): number => Infinity;

  it('Given a valid amount, when creating money, then should create money with two decimal places', () => {
    const amount = aValidAmount();

    const money = Money.fromTotal(amount);

    expect(money.amount).toBe(100.50);
    expect(money.currency).toBe("ARS");
  });

  it('Given an amount with many decimals, when creating money, then should round to two decimal places', () => {
    const amount = 100.56789;

    const money = Money.fromTotal(amount);

    expect(money.amount).toBe(100.57);
  });

  test.each([
    ['empty string', ""],
    ['NaN', NaN],
    ['infinite', Infinity],
    ['negative', -1],
    ['zero', 0],
  ])('Given %s amount, when creating money, then should throw error', (_, value) => {
    const act = () => Money.fromTotal(value as unknown as number);

    expect(act).toThrow("Invalid amount");
  });
});
