export abstract class BusinessRule<T> {
  // Throws BusinessRuleViolation if rule is not satisfied
  abstract validate(entity: T): void;
}
