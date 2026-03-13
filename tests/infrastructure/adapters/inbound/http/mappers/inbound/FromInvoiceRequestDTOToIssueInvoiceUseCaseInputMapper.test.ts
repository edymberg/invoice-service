import { FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper, DTOMappingException } from "../../../../../../../src/infrastructure/adapters/inbound/http/mappers/inbound/FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper";
import { InvoiceRequestDTO } from "../../../../../../../src/infrastructure/adapters/inbound/http/dtos/InvoiceRequestDTO";
import { CONCEPT } from "../../../../../../../src/domain/invoice/vo/Concept";
import { DocumentType } from "../../../../../../../src/domain/invoice/vo/Identification";

describe('FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper', () => {
  const aValidProductsDTO = (): InvoiceRequestDTO => ({
    externalId: "external-123",
    monto: 1000,
    dni: 12345678,
    cuit: null,
    concept: CONCEPT.PRODUCTS,
    serviceFrom: null,
    serviceTo: null,
    pointOfSale: 1
  });

  const aValidServicesDTO = (): InvoiceRequestDTO => ({
    externalId: "external-456",
    monto: 2000,
    dni: null,
    cuit: 2012345678,
    concept: CONCEPT.SERVICES,
    serviceFrom: "2023-06-01",
    serviceTo: "2023-06-15",
    pointOfSale: 2
  });

  let mapper: FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper;

  beforeEach(() => {
    mapper = new FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper();
  });

  it('Given valid products DTO, when mapping, then should return correct use case input', () => {
    const dto = aValidProductsDTO();
    const idempotencyKey = "idem-123";

    const result = mapper.map(dto, idempotencyKey);

    expect(result.externalId).toBe("external-123");
    expect(result.amount).toBe(1000);
    expect(result.idDocument.type).toBe(DocumentType.DNI);
    expect(result.idDocument.value).toBe(12345678);
    expect(result.concept).toBe(CONCEPT.PRODUCTS);
    expect(result.pointOfSale).toBe(1);
    expect(result.idempotencyKey).toBe("idem-123");
  });

  it('Given valid services DTO, when mapping, then should return correct use case input', () => {
    const dto = aValidServicesDTO();
    const idempotencyKey = "idem-456";

    const result = mapper.map(dto, idempotencyKey);

    expect(result.externalId).toBe("external-456");
    expect(result.amount).toBe(2000);
    expect(result.idDocument.type).toBe(DocumentType.CUIT);
    expect(result.idDocument.value).toBe(2012345678);
    expect(result.concept).toBe(CONCEPT.SERVICES);
    expect(result.serviceFrom).toStrictEqual({ day: 1, month: 6, year: 2023 });
    expect(result.serviceTo).toStrictEqual({ day: 15, month: 6, year: 2023 });
    expect(result.pointOfSale).toBe(2);
    expect(result.idempotencyKey).toBe("idem-456");
  });

  it('Given DTO with both DNI and CUIT, when mapping, then should throw DTOMappingException', () => {
    const dto = {
      ...aValidProductsDTO(),
      cuit: 20123456789
    };

    const act = () => mapper.map(dto, "idem-123");

    expect(act).toThrow(DTOMappingException);
    expect(act).toThrow("There where errors mapping the given DTO");
  });

  it('Given DTO with neither DNI nor CUIT, when mapping, then should throw DTOMappingException', () => {
    const dto = {
      ...aValidProductsDTO(),
      dni: null,
      cuit: null
    };

    const act = () => mapper.map(dto, "idem-123");

    expect(act).toThrow(DTOMappingException);
  });

  it('Given services DTO without service dates, when mapping, then should throw DTOMappingException', () => {
    const dto = {
      ...aValidServicesDTO(),
      serviceFrom: null,
      serviceTo: null
    };

    const act = () => mapper.map(dto, "idem-123");

    expect(act).toThrow(DTOMappingException);
  });

  it('Given services DTO with invalid date format, when mapping, then should throw DTOMappingException', () => {
    const dto = {
      ...aValidServicesDTO(),
      serviceFrom: "01-06-2023",
      serviceTo: "15/06/2023"
    };

    const act = () => mapper.map(dto, "idem-123");

    expect(act).toThrow(DTOMappingException);
  });

  it('Given DTO with negative amount, when mapping, then should throw DTOMappingException', () => {
    const dto = {
      ...aValidProductsDTO(),
      monto: -1000
    };

    const act = () => mapper.map(dto, "idem-123");

    expect(act).toThrow(DTOMappingException);
  });

  it('Given DTO with zero amount, when mapping, then should throw DTOMappingException', () => {
    const dto = {
      ...aValidProductsDTO(),
      monto: 0
    };

    const act = () => mapper.map(dto, "idem-123");

    expect(act).toThrow(DTOMappingException);
  });

  it('Given DTO with negative point of sale, when mapping, then should throw DTOMappingException', () => {
    const dto = {
      ...aValidProductsDTO(),
      pointOfSale: -1
    };

    const act = () => mapper.map(dto, "idem-123");

    expect(act).toThrow(DTOMappingException);
  });

  it('Given DTO with invalid concept, when mapping, then should throw DTOMappingException', () => {
    const dto = {
      ...aValidProductsDTO(),
      concept: 3
    };

    const act = () => mapper.map(dto, "idem-123");

    expect(act).toThrow(DTOMappingException);
  });

  it('Given DTO with null external ID, when mapping, then should handle null correctly', () => {
    const dto = {
      ...aValidProductsDTO(),
      externalId: null
    };

    const result = mapper.map(dto, "idem-123");

    expect(result.externalId).toBeNull();
  });

  it('Given DTO with no idempotency key, when mapping, then should handle undefined correctly', () => {
    const dto = aValidProductsDTO();

    const result = mapper.map(dto, undefined);

    expect(result.idempotencyKey).toBeUndefined();
  });

  test.each([
    ["2023-01-01", 1, 1, 2023],
    ["2023-12-31", 31, 12, 2023],
    ["2024-02-29", 29, 2, 2024]
  ])('Given service date "%s", when mapping, then should parse correctly', (dateString, expectedDay, expectedMonth, expectedYear) => {
    const dto = {
      ...aValidServicesDTO(),
      serviceFrom: dateString,
      serviceTo: dateString
    };

    const result = mapper.map(dto, "idem-123");

    expect(result.serviceFrom).toStrictEqual({
      day: expectedDay,
      month: expectedMonth,
      year: expectedYear
    });
    expect(result.serviceTo).toStrictEqual({
      day: expectedDay,
      month: expectedMonth,
      year: expectedYear
    });
  });
});
