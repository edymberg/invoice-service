import { PointOfSale } from "../../../../../src/domain/invoice/vo/PointOfSale";

describe('PointOfSale', () => {
  const aValidPointOfSale = (): number => 5;
  const aDefaultPointOfSale = (): number => 1;
  const aZeroPointOfSale = (): number => 0;
  const aNegativePointOfSale = (): number => -1;
  const aDecimalPointOfSale = (): number => 1.5;

  it('Given a valid point of sale, when creating, then should create with correct value', () => {
    const pointOfSaleValue = aValidPointOfSale();

    const pointOfSale = PointOfSale.from(pointOfSaleValue);

    expect(pointOfSale.value).toBe(pointOfSaleValue);
  });

  it('Given no point of sale value, when creating, then should use default value 1', () => {
    const pointOfSale = PointOfSale.from();

    expect(pointOfSale.value).toBe(aDefaultPointOfSale());
  });

  test.each([
    ['empty string', ""],
    ['NaN', NaN],
    ['infinite', Infinity],
    ['negative', aNegativePointOfSale()],
    ['zero', aZeroPointOfSale()],
    ['decimal', aDecimalPointOfSale()],
  ])('Given %s point of sale, when creating, then should throw error', (invalidity, value) => {
    const pointOfSaleValue = value as number;

    const act = () => PointOfSale.from(pointOfSaleValue);

    expect(act).toThrow("Invalid Point of Sale");
  });
});
