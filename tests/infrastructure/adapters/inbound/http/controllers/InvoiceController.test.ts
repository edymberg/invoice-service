import { InvoiceController } from "../../../../../../src/infrastructure/adapters/inbound/http/controllers/InvoiceController";
import { InvoiceRequestDTO } from "../../../../../../src/infrastructure/adapters/inbound/http/dtos/InvoiceRequestDTO";
import { InvoiceResponseDTO } from "../../../../../../src/infrastructure/adapters/inbound/http/dtos/InvoiceResponseDTO";
import { Request, Response } from "express";

describe('InvoiceController', () => {
  // Factory methods for test data
  const aValidRequestBody = (): any => ({
    externalId: "external-123",
    monto: 1000,
    dni: 12345678,
    cuit: null,
    concept: 1,
    serviceFrom: "2023-06-01",
    serviceTo: "2023-06-15",
    pointOfSale: 1
  });

  const aValidInvoiceRequestDTO = (): InvoiceRequestDTO => ({
    externalId: "external-123",
    monto: 1000,
    dni: 12345678,
    cuit: null,
    concept: 1,
    serviceFrom: "2023-06-01",
    serviceTo: "2023-06-15",
    pointOfSale: 1
  });

  const aValidInvoiceResponseDTO = (): InvoiceResponseDTO => ({
    id: "invoice-123",
    status: "Issued",
    cae: "12345678901234",
    caeVto: "20231231",
    voucherNumber: 1
  });

  // Mock dependencies
  const mockGetInvoice = {
    execute: jest.fn()
  };

  const mockPdfQuery = {
    execute: jest.fn()
  };

  const mockInfraMapper = {
    map: jest.fn()
  };

  const mockInvoiceHandler = {
    handle: jest.fn()
  };

  // Mock Express request and response
  const mockRequest = () => {
    const req: Partial<Request> = {
      body: aValidRequestBody(),
      headers: {
        "idempotency-key": "idem-123"
      }
    };
    return req as Request;
  };

  const mockResponse = () => {
    const res: Partial<Response> = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
      setHeader: jest.fn().mockReturnThis()
    };
    return res as Response;
  };

  let controller: InvoiceController;
  let req: Request;
  let res: Response;

  beforeEach(() => {
    jest.clearAllMocks();
    controller = new InvoiceController(
      mockGetInvoice as any,
      mockInfraMapper as any,
      mockInvoiceHandler as any
    );
    req = mockRequest();
    res = mockResponse();
  });

  describe('create method', () => {
    it('Given valid request body, when creating invoice, then should map request and handle use case', async () => {
      const invoiceDTO = aValidInvoiceRequestDTO();
      const responseDTO = aValidInvoiceResponseDTO();
      const idempotencyKey = "idem-123";

      mockInfraMapper.map.mockReturnValue(invoiceDTO);
      mockInvoiceHandler.handle.mockReturnValue(responseDTO);

      await controller.create(req, res);

      expect(mockInfraMapper.map).toHaveBeenCalledWith(req.body);
      expect(mockInvoiceHandler.handle).toHaveBeenCalledWith(invoiceDTO, idempotencyKey);
      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(responseDTO);
    });

    it('Given request without idempotency key, when creating invoice, then should pass undefined as idempotency key', async () => {
      const reqWithoutIdk = {
        ...req,
        headers: {}
      } as Request;
      const invoiceDTO = aValidInvoiceRequestDTO();
      const responseDTO = aValidInvoiceResponseDTO();

      mockInfraMapper.map.mockReturnValue(invoiceDTO);
      mockInvoiceHandler.handle.mockReturnValue(responseDTO);

      await controller.create(reqWithoutIdk, res);

      expect(mockInvoiceHandler.handle).toHaveBeenCalledWith(invoiceDTO, undefined);
    });

    it('Given mapper throws error, when creating invoice, then should propagate error', async () => {
      const error = new Error("Invalid request body");

      mockInfraMapper.map.mockImplementation(() => {
        throw error;
      });

      await expect(controller.create(req, res)).rejects.toThrow("Invalid request body");
      expect(mockInvoiceHandler.handle).not.toHaveBeenCalled();
    });

    it('Given handler throws error, when creating invoice, then should propagate error', async () => {
      const invoiceDTO = aValidInvoiceRequestDTO();
      const error = new Error("Handler error");

      mockInfraMapper.map.mockReturnValue(invoiceDTO);
      mockInvoiceHandler.handle.mockImplementation(() => {
        throw error;
      });

      await expect(controller.create(req, res)).rejects.toThrow("Handler error");
    });
  });
});
