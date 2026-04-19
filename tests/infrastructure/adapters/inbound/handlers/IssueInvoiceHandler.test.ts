import { IssueInvoiceHandler } from "../../../../../src/infrastructure/adapters/inbound/handlers/IssueInvoiceHandler";
import { IssueInvoiceUseCaseInput } from "../../../../../src/domain/invoice/usecases/IssueInvoice";
import { Invoice } from "../../../../../src/domain/invoice/Invoice";
import { InvoiceStatus } from "../../../../../src/domain/invoice/vo/InvoiceStatus";
import { Identification, DocumentType } from "../../../../../src/domain/invoice/vo/Identification";
import { AbstractUseCaseHandler } from "../../../../../framework/mediator";

jest.mock("../../../../../framework/logging", () => ({
  PinoLoggerFactory: {
    getLogger: jest.fn(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    })),
  },
}));

describe('IssueInvoiceHandler', () => {
  const aValidInput = (): any => ({
    externalId: "external-123",
    monto: 1000,
    dni: 12345678
  });

  const aValidUseCaseInput = (): IssueInvoiceUseCaseInput => ({
    externalId: "external-123",
    amount: 1000,
    idDocument: Identification.builder().type(DocumentType.DNI).value(12345678).build(),
    concept: 1
  }) as IssueInvoiceUseCaseInput;

  const aValidInvoice = (): Invoice => ({
    id: "invoice-123",
    status: InvoiceStatus.Issued,
    externalId: "external-123"
  } as any);

  const aValidOutput = (): any => ({
    id: "invoice-123",
    status: "Issued",
    cae: "12345678901234"
  });

  const mockUseCase = {
    execute: jest.fn()
  };

  const mockInboundMapper = {
    map: jest.fn()
  };

  const mockOutboundMapper = {
    map: jest.fn()
  };

  const mockMaskedDTO = {
    mask: jest.fn()
  };

  let handler: AbstractUseCaseHandler<any, any>;

  beforeEach(() => {
    jest.clearAllMocks();
    handler = new IssueInvoiceHandler(
      mockUseCase as any,
      mockInboundMapper as any,
      mockOutboundMapper as any,
      mockMaskedDTO as any
    );
  });

  it('Given valid input, when handling, then should execute use case and return mapped output', async () => {
    const input = aValidInput();
    const useCaseInput = aValidUseCaseInput();
    const invoice = aValidInvoice();
    const output = aValidOutput();
    const idempotencyKey = "idem-123";

    mockInboundMapper.map.mockReturnValue(useCaseInput);
    mockUseCase.execute.mockResolvedValue(invoice);
    mockOutboundMapper.map.mockReturnValue(output);

    const result = await handler.handle(input, idempotencyKey);

    expect(mockInboundMapper.map).toHaveBeenCalledWith(input, idempotencyKey);
    expect(mockUseCase.execute).toHaveBeenCalledWith(useCaseInput);
    expect(mockOutboundMapper.map).toHaveBeenCalledWith(invoice);
    expect(result).toBe(output);
  });

  it('Given inbound mapper throws error, when handling, then should propagate error', async () => {
    const input = aValidInput();
    const error = new Error("Mapping error");

    mockInboundMapper.map.mockImplementation(() => {
      throw error;
    });

    const act = async () => await handler.handle(input);

    await expect(act).rejects.toThrow("Mapping error");
    expect(mockUseCase.execute).not.toHaveBeenCalled();
    expect(mockOutboundMapper.map).not.toHaveBeenCalled();
  });

  it('Given use case throws error, when handling, then should propagate error', async () => {
    const input = aValidInput();
    const useCaseInput = aValidUseCaseInput();
    const error = new Error("Use case error");

    mockInboundMapper.map.mockReturnValue(useCaseInput);
    mockUseCase.execute.mockRejectedValue(error);

    const act = async () => await handler.handle(input);

    await expect(act).rejects.toThrow("Use case error");
    expect(mockOutboundMapper.map).not.toHaveBeenCalled();
  });

  it('Given outbound mapper throws error, when handling, then should propagate error', async () => {
    const input = aValidInput();
    const useCaseInput = aValidUseCaseInput();
    const invoice = aValidInvoice();
    const error = new Error("Outbound mapping error");

    mockInboundMapper.map.mockReturnValue(useCaseInput);
    mockUseCase.execute.mockResolvedValue(invoice);
    mockOutboundMapper.map.mockImplementation(() => {
      throw error;
    });

    const act = async () => await handler.handle(input);

    await expect(act).rejects.toThrow("Outbound mapping error");
  });

  it('Given no idempotency key, when handling, then should pass only input to inbound mapper', async () => {
    const input = aValidInput();
    const useCaseInput = aValidUseCaseInput();
    const invoice = aValidInvoice();
    const output = aValidOutput();

    mockInboundMapper.map.mockReturnValue(useCaseInput);
    mockUseCase.execute.mockResolvedValue(invoice);
    mockOutboundMapper.map.mockReturnValue(output);

    await handler.handle(input);

    expect(mockInboundMapper.map).toHaveBeenCalledWith(input);
  });
});
