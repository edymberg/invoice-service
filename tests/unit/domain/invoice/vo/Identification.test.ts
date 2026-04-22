import { Identification, DocumentType } from "../../../../../src/domain/invoice/vo/Identification";

describe('Identification', () => {
  const aValidDniValue = (): number => 12345678;
  const aValidCuitValue = (): number => 12345678912;
  const aShortValue = (): number => 1234;
  const aLongValue = (): number => 1234567891234;
  const aZeroValue = (): number => 0;
  const aNegativeValue = (): number => -12345678;
  const aNullValue = (): null => null;
  const anUndefinedValue = (): undefined => undefined;
  const anEmptyValue = (): string => "";

  describe('DocumentType enum', () => {
    test.each([
      [DocumentType.DNI, 96],
      [DocumentType.CUIT, 99],
    ])('Given document type %s, when checking value, then should return %s', (documentType, expectedValue) => {
      expect(documentType).toBe(expectedValue);
    });
  });

  describe('Identification business rules', () => {
    it('Given valid DNI value and type, when creating identification, then should create with correct values', () => {
      const value = aValidDniValue();
      const type = DocumentType.DNI;

      const identification = Identification.builder().value(value).type(type).build();

      expect(identification.value).toBe(value);
      expect(identification.type).toBe(type);
    });

    it('Given valid CUIT value and type, when creating identification, then should create with correct values', () => {
      const value = aValidCuitValue();
      const type = DocumentType.CUIT;

      const identification = Identification.builder().value(value).type(type).build();

      expect(identification.value).toBe(value);
      expect(identification.type).toBe(type);
    });

    it('Given string number value, when creating identification, then should throw error', () => {
      const value = "12345678";
      const type = DocumentType.DNI;

      const act = () => Identification.builder().value(value as unknown as number).type(type).build();

      expect(act).toThrow("Invalid value: 12345678. Should be a positive integer");
    });

    it('Given null value, when creating identification, then should throw error', () => {
      const value = aNullValue();
      const type = DocumentType.DNI;

      const act = () => Identification.builder().value(value as unknown as number).type(type).build();

      expect(act).toThrow("Value is required. Given: null");
    });

    it('Given undefined value, when creating identification, then should throw error', () => {
      const value = anUndefinedValue();
      const type = DocumentType.DNI;

      const act = () => Identification.builder().value(value as unknown as number).type(type).build();

      expect(act).toThrow("Value is required. Given: undefined");
    });

    it('Given empty string value, when creating identification, then should throw error', () => {
      const value = anEmptyValue();
      const type = DocumentType.DNI;

      const act = () => Identification.builder().value(value as unknown as number).type(type).build();

      expect(act).toThrow("Invalid value: empty string. Should be a positive integer");
    });

    it('Given zero value, when creating identification, then should throw error', () => {
      const value = aZeroValue();
      const type = DocumentType.DNI;

      const act = () => Identification.builder().value(value).type(type).build();

      expect(act).toThrow("Invalid value: 0. Should be a positive integer");
    });

    it('Given negative value, when creating identification, then should throw error', () => {
      const value = aNegativeValue();
      const type = DocumentType.DNI;

      const act = () => Identification.builder().value(value).type(type).build();

      expect(act).toThrow("Invalid value: -12345678. Should be a positive integer");
    });

    it('Given short value, when creating identification, then should throw error', () => {
      const value = aShortValue();
      const type = DocumentType.DNI;

      const act = () => Identification.builder().value(value).type(type).build();

      expect(act).toThrow("Invalid value length: 4. Should be between 5 and 12");
    });

    it('Given long value, when creating identification, then should throw error', () => {
      const value = aLongValue();
      const type = DocumentType.DNI;

      const act = () => Identification.builder().value(value).type(type).build();

      expect(act).toThrow("Invalid value length: 13. Should be between 5 and 12");
    });
  });
});
