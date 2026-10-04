import { FromGetInvoiceRequestDTOToGetInvoiceQueryUseCaseInputMapper } from "../../../../../../../../src/infrastructure/adapters/inbound/http/mappers/inbound/FromGetInvoiceRequestDTOToGetInvoiceQueryUseCaseInputMapper";
import { GetInvoiceRequestDTO } from "../../../../../../../../src/infrastructure/adapters/inbound/http/dtos/GetInvoiceRequestDTO";
import { DTOMappingException } from "../../../../../../../../framework/http";

describe('FromGetInvoiceRequestDTOToGetInvoiceQueryUseCaseInputMapper', () => {
  const aValidDTO = (): GetInvoiceRequestDTO => ({
    id: "invoice-123"
  } as GetInvoiceRequestDTO);

  let mapper: FromGetInvoiceRequestDTOToGetInvoiceQueryUseCaseInputMapper;

  beforeEach(() => {
    mapper = new FromGetInvoiceRequestDTOToGetInvoiceQueryUseCaseInputMapper();
  });

  it('Given valid DTO, when mapping, then should return correct use case input', () => {
    const dto = aValidDTO();

    const result = mapper.map(dto);

    expect(result.id).toBe("invoice-123");
  });

  it('Given DTO with empty id, when mapping, then should throw DTOMappingException', () => {
    const dto: GetInvoiceRequestDTO = {
      id: ""
    } as GetInvoiceRequestDTO;

    const act = () => mapper.map(dto);

    expect(act).toThrow(DTOMappingException);
    expect(act).toThrow("There where errors mapping the given DTO");
    try {
      mapper.map(dto);
    } catch (error) {
      expect(error).toBeInstanceOf(DTOMappingException);
      expect((error as DTOMappingException).error.length).toBe(1);
      expect((error as DTOMappingException).error[0].path).toBe("id");
      expect((error as DTOMappingException).error[0].message).toBe("Get Invoice Request DTO must be a valid id");
      expect((error as DTOMappingException).error[0].code).toBe("invalid");
    }
  });

  it('Given DTO with missing id, when mapping, then should throw DTOMappingException', () => {
    const dto: GetInvoiceRequestDTO = {
      id: undefined as any
    } as GetInvoiceRequestDTO;

    const act = () => mapper.map(dto);

    expect(act).toThrow(DTOMappingException);
    expect(act).toThrow("There where errors mapping the given DTO");
    try {
      mapper.map(dto);
    } catch (error) {
      expect(error).toBeInstanceOf(DTOMappingException);
      expect((error as DTOMappingException).error.length).toBe(1);
      expect((error as DTOMappingException).error[0].path).toBe("id");
      expect((error as DTOMappingException).error[0].message).toBe("Get Invoice Request DTO must be a valid id");
      expect((error as DTOMappingException).error[0].code).toBe("invalid");
    }
  });
});
