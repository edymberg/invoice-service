import { FromHttpToInvoiceRequestDTOMapper } from "../../../../../../../../src/infrastructure/adapters/inbound/http/mappers/infra/FromHttpToInvoiceRequestDTOMapper";
import { CreateInvoiceRequestDTO } from "../../../../../../../../src/infrastructure/adapters/inbound/http/dtos/CreateInvoiceRequestDTO";

jest.mock("../../../../../../../../framework/logging", () => ({
  PinoLoggerFactory: {
    getLogger: jest.fn(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    })),
  },
}));

describe('FromHttpToInvoiceRequestDTOMapper', () => {
  const aValidHttpRequest = (): CreateInvoiceRequestDTO => ({
    externalId: "external-123",
    monto: 1000,
    dni: 37597072,
    cuit: null,
    concept: 1,
    serviceFrom: "2023-06-01",
    serviceTo: "2023-06-15",
    pointOfSale: 1
  } as CreateInvoiceRequestDTO);

  const aValidServicesRequest = (): CreateInvoiceRequestDTO => ({
    externalId: "external-456",
    monto: 2000,
    dni: null,
    cuit: 20375970724,
    concept: 2,
    serviceFrom: "2023-06-01",
    serviceTo: "2023-06-15",
    pointOfSale: 2
  } as CreateInvoiceRequestDTO);

  let mapper: FromHttpToInvoiceRequestDTOMapper;

  beforeEach(() => {
    jest.clearAllMocks();
    mapper = new FromHttpToInvoiceRequestDTOMapper();
  });

  it('Given valid HTTP request with DNI, when mapping, then should return correct DTO', () => {
    const httpRequest = aValidHttpRequest();

    const result = mapper.map(httpRequest);

    expect(result).toStrictEqual({
      externalId: "external-123",
      monto: 1000,
      dni: 37597072,
      cuit: null,
      concept: 1,
      serviceFrom: "2023-06-01",
      serviceTo: "2023-06-15",
      pointOfSale: 1
    });
  });

  it('Given valid HTTP request with CUIT, when mapping, then should return correct DTO', () => {
    const httpRequest = aValidServicesRequest();

    const result = mapper.map(httpRequest);

    expect(result).toStrictEqual({
      externalId: "external-456",
      monto: 2000,
      dni: null,
      cuit: 20375970724,
      concept: 2,
      serviceFrom: "2023-06-01",
      serviceTo: "2023-06-15",
      pointOfSale: 2
    });
  });

  it('Given HTTP request with invalid externalId, when mapping, then should throw validation error', () => {
    const httpRequest = {
      ...aValidHttpRequest(),
      externalId: ""
    };

    const act = () => mapper.map(httpRequest);

    expect(act).toThrow();
  });

  it('Given HTTP request with negative amount, when mapping, then should throw validation error', () => {
    const httpRequest = {
      ...aValidHttpRequest(),
      monto: -1000
    };

    const act = () => mapper.map(httpRequest);

    expect(act).toThrow();
  });

  it('Given HTTP request with invalid DNI, when mapping, then should throw validation error', () => {
    const httpRequest = {
      ...aValidHttpRequest(),
      dni: 123
    };

    const act = () => mapper.map(httpRequest);

    expect(act).toThrow();
  });

  it('Given HTTP request with invalid concept, when mapping, then should throw validation error', () => {
    const httpRequest = {
      ...aValidHttpRequest(),
      concept: 3
    };

    const act = () => mapper.map(httpRequest);

    expect(act).toThrow();
  });

  it('Given HTTP request with invalid service date format, when mapping, then should throw validation error', () => {
    const httpRequest = {
      ...aValidHttpRequest(),
      serviceFrom: "01/06/2023"
    };

    const act = () => mapper.map(httpRequest);

    expect(act).toThrow();
  });

  it('Given HTTP request with non-positive point of sale, when mapping, then should throw validation error', () => {
    const httpRequest = {
      ...aValidHttpRequest(),
      pointOfSale: 0
    };

    const act = () => mapper.map(httpRequest);

    expect(act).toThrow();
  });

  test.each([
    ["2023-01-01", "2023-12-31"],
    ["2023-06-15", "2023-06-30"],
    ["2024-02-29", "2024-03-15"]
  ])('Given service dates %s and %s, when mapping, then should accept valid date formats', (serviceFrom, serviceTo) => {
    const httpRequest = {
      ...aValidServicesRequest(),
      serviceFrom,
      serviceTo
    };

    const result = mapper.map(httpRequest);

    expect(result.serviceFrom).toBe(serviceFrom);
    expect(result.serviceTo).toBe(serviceTo);
  });
});
