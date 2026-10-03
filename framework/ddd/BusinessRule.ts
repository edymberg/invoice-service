export type DomainError = {
  path: string;
  code: string;
  message: string;
}[];

export class BusinessRuleViolation extends Error {
  public readonly error: DomainError;

  constructor(message: string, error: DomainError) {
    super(message);
    this.error = error;
  }
}

export abstract class BusinessRule<T> {
  validate(entity: T): void {
    const domainError: DomainError = this.doValidate(entity);

    if (domainError.length > 0) {
      throw new BusinessRuleViolation(
        "There where errors validating the given entity",
        domainError,
      );
    }
  }

  abstract doValidate(entity: T): DomainError;
}
