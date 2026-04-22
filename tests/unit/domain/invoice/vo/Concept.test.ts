import { CONCEPT, Concept } from "../../../../../src/domain/invoice/vo/Concept";

describe('Concept', () => {
  const aServicesConcept = (): CONCEPT => CONCEPT.SERVICES;
  const aProductsConcept = (): CONCEPT => CONCEPT.PRODUCTS;

  describe('CONCEPT enum', () => {
    test.each([
      [CONCEPT.PRODUCTS, 1],
      [CONCEPT.SERVICES, 2],
    ])('Given concept %s, when checking value, then should return %s', (concept, expectedValue) => {
      expect(concept).toBe(expectedValue);
    });
  });

  describe('#from', () => {
    it('Given services concept, when creating, then should create with correct value', () => {
      const conceptValue = aServicesConcept();

      const concept = Concept.from(conceptValue);

      expect(concept.value).toBe(conceptValue);
    });

    it('Given products concept, when creating, then should create with correct value', () => {
      const conceptValue = aProductsConcept();

      const concept = Concept.from(conceptValue);

      expect(concept.value).toBe(conceptValue);
    });

    it('Given same concept value, when creating multiple instances, then should create different instances', () => {
      const conceptValue = aServicesConcept();

      const concept1 = Concept.from(conceptValue);
      const concept2 = Concept.from(conceptValue);

      expect(concept1).not.toBe(concept2);
      expect(concept1.value).toBe(concept2.value);
    });
  });

  describe('#isService', () => {
    it('Given services concept, when checking isService, then should return true', () => {
      const concept = Concept.from(aServicesConcept());

      const result = concept.isService();

      expect(result).toBe(true);
    });

    it('Given products concept, when checking isService, then should return false', () => {
      const concept = Concept.from(aProductsConcept());

      const result = concept.isService();

      expect(result).toBe(false);
    });
  });

  describe('#isProduct', () => {
    it('Given products concept, when checking isProduct, then should return true', () => {
      const concept = Concept.from(aProductsConcept());

      const result = concept.isProduct();

      expect(result).toBe(true);
    });

    it('Given services concept, when checking isProduct, then should return false', () => {
      const concept = Concept.from(aServicesConcept());

      const result = concept.isProduct();

      expect(result).toBe(false);
    });
  });
});
