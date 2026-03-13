export class BusinessRuleViolation extends Error {
  constructor(message: string) {
    super(message);
  }
}
