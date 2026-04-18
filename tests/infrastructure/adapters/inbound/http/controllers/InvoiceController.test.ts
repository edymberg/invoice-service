import { TypedRequest, TypedResponse } from "../../../../../../framework/http";
import { InvoiceController } from "../../../../../../src/infrastructure/adapters/inbound/http/controllers/InvoiceController";
import { CreateInvoiceRequestDTO } from "../../../../../../src/infrastructure/adapters/inbound/http/dtos/CreateInvoiceRequestDTO";
import { CreateInvoiceResponseDTO } from "../../../../../../src/infrastructure/adapters/inbound/http/dtos/CreateInvoiceResponseDTO";

describe('InvoiceController', () => {
  const aValidRequestBody = (): CreateInvoiceRequestDTO => ({
    externalId: "external-123",
    monto: 1000,
    dni: 12345678,
    cuit: null,
    concept: 1,
    serviceFrom: "2023-06-01",
    serviceTo: "2023-06-15",
    pointOfSale: 1
  });

  const aValidCreateInvoiceRequestDTO = (): CreateInvoiceRequestDTO => ({
    externalId: "external-123",
    monto: 1000,
    dni: 12345678,
    cuit: null,
    concept: 1,
    serviceFrom: "2023-06-01",
    serviceTo: "2023-06-15",
    pointOfSale: 1
  });

  const aValidCreateInvoiceResponseDTO = (): CreateInvoiceResponseDTO => ({
    id: "invoice-123",
    status: "Issued",
    cae: "12345678901234",
    caeVto: "20231231",
    voucherNumber: 1
  });

  const mockGetInvoice = {
    execute: jest.fn()
  };

  const mockInvoiceHandler = {
    handle: jest.fn()
  };

  const mockRequest: () => TypedRequest<CreateInvoiceRequestDTO> = () => {
    const req: Partial<TypedRequest<CreateInvoiceRequestDTO>> = {
      body: aValidRequestBody(),
      headers: {
        "idempotency-key": "idem-123"
      }
    };
    return req as TypedRequest<CreateInvoiceRequestDTO>;
  };

  const mockResponse: () => TypedResponse<CreateInvoiceResponseDTO> = () => {
    const res: Partial<TypedResponse<CreateInvoiceResponseDTO>> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };
    return res as TypedResponse<CreateInvoiceResponseDTO>;
  };

  let controller: InvoiceController;
  let req: TypedRequest<CreateInvoiceRequestDTO>;
  let res: TypedResponse<CreateInvoiceResponseDTO>;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new InvoiceController(
      mockGetInvoice as any,
      mockInvoiceHandler as any,
    );
    req = mockRequest();
    res = mockResponse();
  });

  describe('create method', () => {
    it('Given valid request body, when creating invoice, then should map request and handle use case', async () => {
      const invoiceDTO = aValidCreateInvoiceRequestDTO();
      const responseDTO = aValidCreateInvoiceResponseDTO();
      const idempotencyKey = "idem-123";

      mockInvoiceHandler.handle.mockReturnValue(responseDTO);

      await controller.create(req, res);

      expect(mockInvoiceHandler.handle).toHaveBeenCalledWith(invoiceDTO, idempotencyKey);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(responseDTO);
    });

    it('Given request without idempotency key, when creating invoice, then should pass undefined as idempotency key', async () => {
      const reqWithoutIdk = {
        ...req,
        headers: {}
      } as TypedRequest<CreateInvoiceRequestDTO>;
      const invoiceDTO = aValidCreateInvoiceRequestDTO();
      const responseDTO = aValidCreateInvoiceResponseDTO();

      mockInvoiceHandler.handle.mockReturnValue(responseDTO);

      await controller.create(reqWithoutIdk, res);

      expect(mockInvoiceHandler.handle).toHaveBeenCalledWith(invoiceDTO, undefined);
    });

    it('Given handler throws error, when creating invoice, then should propagate error', async () => {
      const error = new Error("Handler error");

      mockInvoiceHandler.handle.mockImplementation(() => {
        throw error;
      });

      await expect(controller.create(req, res)).rejects.toThrow("Handler error");
    });
  });
});
