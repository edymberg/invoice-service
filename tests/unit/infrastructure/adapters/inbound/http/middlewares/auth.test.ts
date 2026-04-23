import { Request, Response, NextFunction } from "express";
import { authMiddlewareFactory } from "../../../../../../../src/infrastructure/adapters/inbound/http/middlewares/auth";
import { InvoiceServiceConfig } from "../../../../../../../src/infrastructure/config/env";

jest.mock("../../../../../../../framework/logging", () => ({
  PinoLoggerFactory: {
    getLogger: jest.fn(() => ({
      error: jest.fn(),
    })),
  },
}));

jest.mock("../../../../../../../src/infrastructure/config/env", () => ({
  InvoiceServiceConfig: {},
  buildInvoiceServiceConfig: jest.fn(() => ({
    apiKey: "test-api-key-123",
  })),
}));

describe("authMiddleware", () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockNext: NextFunction;
  let mockConfig: InvoiceServiceConfig;
  let authMiddleware: (req: Request, res: Response, next: NextFunction) => void;

  beforeEach(() => {
    mockRequest = {
      headers: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
    mockConfig = {
      apiKey: "test-api-key-123",
    } as InvoiceServiceConfig;
    authMiddleware = authMiddlewareFactory(mockConfig);
  });

  describe("Given valid authentication", () => {
    it("should call next() when authorization header is present and valid", () => {
      mockRequest.headers = {
        authorization: "Bearer test-api-key-123",
      };

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
      expect(mockResponse.status).not.toHaveBeenCalled();
    });
  });

  describe("Given missing authorization header", () => {
    it("should return 401 when authorization header is missing", () => {
      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization header is empty", () => {
      mockRequest.headers = {
        authorization: "",
      };

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Given invalid authorization format", () => {
    it("should return 401 when authorization header doesn't start with Bearer", () => {
      mockRequest.headers = {
        authorization: "Basic test-api-key-123",
      };

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when authorization header only contains 'Bearer'", () => {
      mockRequest.headers = {
        authorization: "Bearer",
      };

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Given invalid API key", () => {
    it("should return 401 when token doesn't match expected API key", () => {
      mockRequest.headers = {
        authorization: "Bearer wrong-api-key",
      };

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(mockNext).not.toHaveBeenCalled();
    });

    it("should return 401 when token is empty", () => {
      mockRequest.headers = {
        authorization: "Bearer ",
      };

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Unauthorized" });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Given error scenarios", () => {
    it("should return 500 when an exception occurs", () => {
      // Force an error by making headers throw an exception
      Object.defineProperty(mockRequest, 'headers', {
        get() {
          throw new Error('Unexpected error');
        }
      });

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({ error: "Internal Server Error" });
      expect(mockNext).not.toHaveBeenCalled();
    });
  });

  describe("Given case sensitivity", () => {
    it("should handle authorization header case correctly", () => {
      mockRequest.headers = {
        authorization: "Bearer test-api-key-123",
      };

      authMiddleware(
        mockRequest as Request,
        mockResponse as Response,
        mockNext
      );

      expect(mockNext).toHaveBeenCalled();
    });
  });
});
