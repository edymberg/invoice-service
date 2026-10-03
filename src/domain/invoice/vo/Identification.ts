import { BusinessRule, DomainError } from "../../../../framework/ddd";

class IdentificationValueBusinessRules extends BusinessRule<Identification> {
  private readonly CODE = "IDENTIFICATION";
  private readonly MIN_LENGTH = 5;
  private readonly MAX_LENGTH = 12;

  private isEmpty(value: unknown): boolean {
    return value === null || value === undefined || value.toString().trim() === "";
  }

  private ilegalNumber(value: unknown): boolean {
    return !Number.isInteger(value) || Number(value) <= 0;
  }

  private outOfBoundary(value: unknown): boolean {
    const len = String(value).length;
    return len < this.MIN_LENGTH || len > this.MAX_LENGTH;
  }

  doValidate(identification: Identification): DomainError {
    const domainError: DomainError = [];
    const value: unknown = identification.value;

    if (this.isEmpty(value)) {
      domainError.push({
        path: "identification.value",
        code: `${this.CODE}-000-000`,
        message: `Value is required. Given: empty string`,
      });
    }
    if (!this.isEmpty(value) && this.ilegalNumber(value)) {
      domainError.push({
        path: "identification.value",
        code: `${this.CODE}-000-001`,
        message: `Invalid value: ${value}. Should be a positive integer`,
      });
    }
    if (!this.isEmpty(value) && !this.ilegalNumber(value) && this.outOfBoundary(value)) {
      domainError.push({
        path: "identification.value",
        code: `${this.CODE}-000-002`,
        message: `Invalid value length: ${String(value).length}. Should be between ${this.MIN_LENGTH} and ${this.MAX_LENGTH}`,
      });
    }
    return domainError;
  }
}

export enum DocumentType {
  DNI = 96,
  CUIT = 99,
  UNRECOGNIZED = 0,
}

interface IdentificationFactoryI {
  build(): Identification;
  type(type: DocumentType): IdentificationFactoryI;
  value(value: number): IdentificationFactoryI;
}

export class Identification {
  // TODO: ¿las business rules deberian ser pasadas por constructor?
  private businessRules: BusinessRule<Identification>[] = [new IdentificationValueBusinessRules()];

  private constructor(
    public readonly type: DocumentType,
    public readonly value: number,
  ) {}

  public static builder(): IdentificationFactoryI {
    return new Identification.Factory();
  }

  private static _initialize(value: number, type: DocumentType): Identification {
    const identification = new Identification(type, value);
    identification.businessRules.forEach((rule) => rule.validate(identification));
    return identification;
  }

  private static Factory = class IdentificationFactory implements IdentificationFactoryI {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
  };
}
