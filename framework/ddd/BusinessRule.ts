import { BusinessRuleViolation } from "./BusinessRuleViolation";

export abstract class BusinessRule<T> {
  validate(entity: T): void {
    const violation: BusinessRuleViolation | null = this.doValidate(entity);
    if (violation) {
      throw violation;
    }
  }
  
  abstract doValidate(entity: T): BusinessRuleViolation | null;
}
