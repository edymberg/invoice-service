export enum DocumentType {
  DNI = 96,
  CUIT = 99,
  UNRECOGNIZED = 0,
}

interface IdentificationFactoryI {
  build(): Identification
  type(type: DocumentType): IdentificationFactoryI
  value(value: number): IdentificationFactoryI
}

// TODO: review business rules as Invoice
export class Identification {
  private constructor(
    public readonly type: DocumentType,
    public readonly value: number
  ) {}

  public static builder(): IdentificationFactoryI {
    return new Identification.Factory();
  }

  private static _initialize(value: number, type: DocumentType): Identification {
    if (value === null || value === undefined) {
      throw new Error("Value required");
    }
    const num = Number(value);
    if (!Number.isInteger(num) || num <= 0) {
      throw new Error("Invalid value");
    }
    const len = num.toString().length;
    if (len < 5 || len > 12) {
      throw new Error("Invalid value length");
    }

    return new Identification(type, num);
  }

  private static Factory = class IdentificationFactory implements IdentificationFactoryI {
    private fieldsMap: Record<string, any>;

    constructor() {
      this.fieldsMap = {};
    }

    public build(): Identification {
      return Identification._initialize(this.fieldsMap.value, this.fieldsMap.type);
    }
    
    public type(type: DocumentType): IdentificationFactoryI {
      this.fieldsMap.type = type;
      return this;
    }

    public value(value: number): IdentificationFactoryI {
      this.fieldsMap.value = value;
      return this;
    }
  }
}