export class PointOfSale {
  private constructor(public readonly value: number) {}
  static from(n?: number): PointOfSale {
    const num = n ?? 1;
    if (!Number.isInteger(num) || num <= 0) {
      throw new Error("Invalid Point of Sale");
    }
    return new PointOfSale(num);
  }
}
