import { BusinessRuleViolation } from "../../../../framework/BusinessRuleViolation";

export class IdentificationBusinessRuleViolation extends BusinessRuleViolation {
  constructor(message: string) {
    super(message);
  }
}

interface IdentificationBusinessRule {
  validate(identification: Identification): void;
}

class IdentificationValueBusinessRules implements IdentificationBusinessRule {  
  validate(identification: Identification): void {
    const value: any = identification.value;

    if (value === null || value === undefined) {
      throw new IdentificationBusinessRuleViolation(`Value is required. Given: ${value}`);
    }
    if (!Number.isInteger(value) || value <= 0) {
      throw new IdentificationBusinessRuleViolation(`Invalid value: ${value === "" ? "empty string" : value}. Should be a positive integer`);
    }
    const len = value.toString().length;
    const minLen = 5;
    const maxLen = 12;
    if (len < minLen || len > maxLen) {
      throw new IdentificationBusinessRuleViolation(`Invalid value length: ${len}. Should be between ${minLen} and ${maxLen}`);
    }
  }
}

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
  // TODO: ¿las business rules deberian ser pasadas por constructor?
  private businessRules: IdentificationBusinessRule[] = [
    new IdentificationValueBusinessRules()
  ];

  private constructor(
    public readonly type: DocumentType,
    public readonly value: number
  ) {}

  public static builder(): IdentificationFactoryI {
    return new Identification.Factory();
  }

  private static _initialize(value: number, type: DocumentType): Identification {
    const identification = new Identification(type, value);
    identification.businessRules.forEach(rule => rule.validate(identification));
    return identification;
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