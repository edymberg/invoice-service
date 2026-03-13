export enum CONCEPT {
  SERVICES = 2,
  PRODUCTS = 1,
}

export class Concept {
  public readonly value: CONCEPT;

  private constructor(value: CONCEPT) {
    this.value = value;
  }

  static from(value: CONCEPT) {
    return new Concept(value);
  }

  isService() {
    return this.value === CONCEPT.SERVICES;
  }

  isProduct() {
    return this.value === CONCEPT.PRODUCTS;
  }
}
