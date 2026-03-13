import { IssueInvoiceUseCaseImpl } from "../../../src/business/usecases/IssueInvoiceUseCaseImpl";
import { Invoice } from "../../../src/domain/invoice/Invoice";
import { IssueInvoiceUseCaseInput } from "../../../src/domain/invoice/usecases/IssueInvoice";
import { CONCEPT } from "../../../src/domain/invoice/vo/Concept";
import { InvoiceStatus } from "../../../src/domain/invoice/vo/InvoiceStatus";
import { VoucherType } from "../../../src/domain/invoice/vo/VoucherType";
import { DocumentType, Identification } from "../../../src/domain/invoice/vo/Identification";

describe('IssueInvoiceUseCaseImpl', () => {
  const aValidInput = (): IssueInvoiceUseCaseInput => ({
    externalId: "external-123",
    amount: 1000,
    idDocument: Identification.initialize(12345678, DocumentType.DNI),
    concept: CONCEPT.PRODUCTS,
    pointOfSale: 1,
    idempotencyKey: "idem-123"
  });

  const aServiceInput = (): IssueInvoiceUseCaseInput => ({
    externalId: "external-456",
    amount: 2000,
    idDocument: Identification.initialize(2012345678, DocumentType.CUIT),
    concept: CONCEPT.SERVICES,
    serviceFrom: { day: 1, month: 6, year: 2023 },
    serviceTo: { day: 15, month: 6, year: 2023 },
    pointOfSale: 2
  });

  const mockRepository = {
    save: jest.fn(),
    findById: jest.fn(),
    findByExternalId: jest.fn(),
    update: jest.fn()
  };

  const mockElectronicBilling = {
    createNextVoucher: jest.fn(),
    getServerStatus: jest.fn()
  };

  const mockIdempotencyStore = {
    get: jest.fn(),
    put: jest.fn()
  };

  const aMockInvoice = (): Invoice => {
    return Invoice.builder()
      .id("invoice-123")
      .externalId("external-123")
      .status(InvoiceStatus.Draft)
      .voucherType(VoucherType.C)
      .pointOfSale({ value: 1 } as any)
      .concept({ value: CONCEPT.PRODUCTS, isProduct: () => true, isService: () => false } as any)
      .idDocument({ type: DocumentType.DNI, value: 12345678 } as any)
      .date({ value: 20230615 } as any)
      .total({ amount: 1000, currency: "ARS" } as any)
      .build();
  };

  let useCase: IssueInvoiceUseCaseImpl;

  beforeEach(() => {
    jest.clearAllMocks();
    useCase = new IssueInvoiceUseCaseImpl(
      mockRepository as any,
      mockElectronicBilling as any,
      mockIdempotencyStore as any
    );
  });

  it('Given valid input with existing idempotency key, when executing, then should return existing invoice', async () => {
    const input = aValidInput();
    const existingInvoice = aMockInvoice();

    mockIdempotencyStore.get.mockResolvedValue({ invoiceId: "invoice-123" });
    mockRepository.findById.mockResolvedValue(existingInvoice);

    const result = await useCase.execute(input);

    expect(mockIdempotencyStore.get).toHaveBeenCalledWith("external-123");
    expect(mockRepository.findById).toHaveBeenCalledWith("invoice-123");
    expect(result.invoice).toBe(existingInvoice);
    expect(mockElectronicBilling.createNextVoucher).not.toHaveBeenCalled();
  });

  it('Given valid input with no existing idempotency, when executing, then should create new invoice successfully', async () => {
    const input = aValidInput();
    const afipResponse = {
      CAE: "12345678901234",
      CAEFchVto: "20231231",
      voucherNumber: 1,
      rawResponse: { status: "ok" }
    };

    mockIdempotencyStore.get.mockResolvedValue(null);
    mockElectronicBilling.createNextVoucher.mockResolvedValue(afipResponse);

    const result = await useCase.execute(input);

    expect(mockIdempotencyStore.get).toHaveBeenCalledWith("external-123");
    expect(mockElectronicBilling.createNextVoucher).toHaveBeenCalledWith(
      expect.objectContaining({
        CantReg: 1,
        PtoVta: 1,
        CbteTipo: VoucherType.C,
        Concepto: 1,
        DocTipo: DocumentType.DNI,
        DocNro: 12345678,
        ImpTotal: 1000,
        ImpNeto: 1000
      })
    );
    expect(mockRepository.save).toHaveBeenCalledWith(result.invoice);
    expect(mockIdempotencyStore.put).toHaveBeenCalledWith("external-123", result.invoice.id);
    expect(result.invoice.status).toBe(InvoiceStatus.Issued);
  });

  it('Given service concept input, when executing, then should include service dates in AFIP request', async () => {
    const input = aServiceInput();
    const afipResponse = {
      CAE: "12345678901234",
      CAEFchVto: "20231231",
      voucherNumber: 2
    };

    mockIdempotencyStore.get.mockResolvedValue(null);
    mockElectronicBilling.createNextVoucher.mockResolvedValue(afipResponse);

    await useCase.execute(input);

    expect(mockElectronicBilling.createNextVoucher).toHaveBeenCalledWith(
      expect.objectContaining({
        Concepto: 2,
        DocTipo: DocumentType.CUIT,
        DocNro: 2012345678,
        FchServDesde: 20230601,
        FchServHasta: 20230615
      })
    );
  });

  it('Given AFIP billing failure, when executing, then should mark invoice as failed and save', async () => {
    const input = aValidInput();
    const error = new Error("AFIP connection failed");

    mockIdempotencyStore.get.mockResolvedValue(null);
    mockElectronicBilling.createNextVoucher.mockRejectedValue(error);

    const act = async () => await useCase.execute(input);

    await expect(act).rejects.toThrow("AFIP connection failed");
    expect(mockRepository.save).toHaveBeenCalledTimes(1);
    
    const savedInvoice = mockRepository.save.mock.calls[0][0];
    expect(savedInvoice.status).toBe(InvoiceStatus.Failed);
  });

  it('Given input with CUIT document, when executing, then should use CUIT document type', async () => {
    const input = {
      ...aValidInput(),
      idDocument: Identification.initialize(2012345678, DocumentType.CUIT)
    };

    mockIdempotencyStore.get.mockResolvedValue(null);
    mockElectronicBilling.createNextVoucher.mockResolvedValue({
      CAE: "12345678901234",
      CAEFchVto: "20231231",
      voucherNumber: 1
    });

    await useCase.execute(input);

    expect(mockElectronicBilling.createNextVoucher).toHaveBeenCalledWith(
      expect.objectContaining({
        DocTipo: DocumentType.CUIT,
        DocNro: 2012345678
      })
    );
  });

  it('Given input with no point of sale, when executing, then should use default point of sale', async () => {
    const input = {
      ...aValidInput(),
      pointOfSale: undefined
    };

    mockIdempotencyStore.get.mockResolvedValue(null);
    mockElectronicBilling.createNextVoucher.mockResolvedValue({
      CAE: "12345678901234",
      CAEFchVto: "20231231",
      voucherNumber: 1
    });

    await useCase.execute(input);

    expect(mockElectronicBilling.createNextVoucher).toHaveBeenCalledWith(
      expect.objectContaining({
        PtoVta: 1
      })
    );
  });
});
