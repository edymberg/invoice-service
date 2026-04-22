import { Router } from "express";
import { buildRouter } from "../../../../../../src/infrastructure/adapters/inbound/http/routes";
import { AfipController } from "../../../../../../src/infrastructure/adapters/inbound/http/controllers/AfipController";
import { HealthController } from "../../../../../../src/infrastructure/adapters/inbound/http/controllers/HealthController";
import { InvoiceController } from "../../../../../../src/infrastructure/adapters/inbound/http/controllers/InvoiceController";
import { SalesPointsController } from "../../../../../../src/infrastructure/adapters/inbound/http/controllers/SalesPointsController";
import { correlationMiddleware } from "../../../../../../src/infrastructure/adapters/inbound/http/middlewares/correlation";
import { authMiddleware } from "../../../../../../src/infrastructure/adapters/inbound/http/middlewares/auth";
import { errorHandler } from "../../../../../../src/infrastructure/adapters/inbound/http/middlewares/errorHandler";
import { bodyMapperMiddleware, paramsMapperMiddleware, Swagger } from "../../../../../../framework/http";

jest.mock("express");
jest.mock("../../../../../../src/infrastructure/adapters/inbound/http/middlewares/correlation");
jest.mock("../../../../../../src/infrastructure/adapters/inbound/http/middlewares/auth");
jest.mock("../../../../../../src/infrastructure/adapters/inbound/http/middlewares/errorHandler");
jest.mock("../../../../../../framework/http/middlewares/bodyMapper");
jest.mock("../../../../../../framework/logging", () => ({
  PinoLoggerFactory: {
    getLogger: jest.fn(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    })),
  },
}));

describe("buildRouter", () => {
  const mockRouter = {
    use: jest.fn(),
    get: jest.fn(),
    post: jest.fn(),
  };

  const mockInvoiceController = {
    create: jest.fn(),
    get: jest.fn(),
  } as unknown as InvoiceController;

  const mockAfipController = {
    status: jest.fn(),
  } as unknown as AfipController;

  const mockHealthController = {
    health: jest.fn(),
  } as unknown as HealthController;

  const mockSalesPointsController = {
    list: jest.fn(),
  } as unknown as SalesPointsController;

  const mockSwagger = {
    serve: jest.fn().mockReturnValue(jest.fn()),
    setup: jest.fn().mockReturnValue(jest.fn()),
  } as unknown as Swagger;

  const buildDependencies = () => ({
    invoiceController: mockInvoiceController,
    afipController: mockAfipController,
    healthController: mockHealthController,
    salesPointsController: mockSalesPointsController,
    swagger: mockSwagger,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    (Router as jest.Mock).mockReturnValue(mockRouter);
  });

  it("Given valid dependencies, when building router, then it should return a router instance", () => {
    const deps = buildDependencies();

    const result = buildRouter(deps);

    expect(Router).toHaveBeenCalled();
    expect(result).toBe(mockRouter);
  });

  it("Given valid dependencies, when building router, then it should register correlation middleware first", () => {
    const deps = buildDependencies();

    buildRouter(deps);

    expect(mockRouter.use).toHaveBeenCalledWith(correlationMiddleware);
    expect(mockRouter.use).toHaveBeenCalledTimes(4);
  });

  it("Given valid dependencies, when building router, then it should register health endpoint without auth", () => {
    const deps = buildDependencies();

    buildRouter(deps);

    expect(mockRouter.get).toHaveBeenCalledWith("/health", deps.healthController.health);
  });

  it("Given valid dependencies, when building router, then it should register swagger documentation endpoint", () => {
    const deps = buildDependencies();

    buildRouter(deps);

    expect(mockRouter.use).toHaveBeenCalledWith("/api-docs", expect.any(Function), expect.any(Function));
    expect(deps.swagger.serve).toHaveBeenCalled();
    expect(deps.swagger.setup).toHaveBeenCalled();
  });

  it("Given valid dependencies, when building router, then it should register auth middleware before protected routes", () => {
    const deps = buildDependencies();

    buildRouter(deps);

    expect(mockRouter.use).toHaveBeenCalledWith(authMiddleware);
  });

  it("Given valid dependencies, when building router, then it should register POST invoices endpoint with body mapper", () => {
    const deps = buildDependencies();
    const mockBodyMapper = jest.fn();
    (bodyMapperMiddleware as jest.Mock).mockReturnValue(mockBodyMapper);

    buildRouter(deps);

    expect(mockRouter.post).toHaveBeenCalledWith(
      "/invoices",
      mockBodyMapper,
      expect.any(Function)
    );
    expect(bodyMapperMiddleware).toHaveBeenCalledWith(expect.any(Object));
  });

  it("Given valid dependencies, when building router, then it should register GET invoices by id endpoint with params mapper", () => {
    const deps = buildDependencies();
    const mockParamsMapper = jest.fn();
    (paramsMapperMiddleware as jest.Mock).mockReturnValue(mockParamsMapper);

    buildRouter(deps);

    expect(mockRouter.get).toHaveBeenCalledWith(
      "/invoices/:id",
      mockParamsMapper,
      expect.any(Function)
    );
    expect(paramsMapperMiddleware).toHaveBeenCalledWith(expect.any(Object));
  });

  it("Given valid dependencies, when building router, then it should register AFIP status endpoint", () => {
    const deps = buildDependencies();

    buildRouter(deps);

    expect(mockRouter.get).toHaveBeenCalledWith("/afip/status", expect.any(Function));
  });

  it("Given valid dependencies, when building router, then it should register sales points endpoint", () => {
    const deps = buildDependencies();

    buildRouter(deps);

    expect(mockRouter.get).toHaveBeenCalledWith("/sales-points", expect.any(Function));
  });

  it("Given valid dependencies, when building router, then it should register error handler middleware last", () => {
    const deps = buildDependencies();

    buildRouter(deps);

    expect(mockRouter.use).toHaveBeenCalledWith(errorHandler);
    const lastCall = mockRouter.use.mock.calls[mockRouter.use.mock.calls.length - 1];
    expect(lastCall[0]).toBe(errorHandler);
  });

  it("Given valid dependencies, when building router, then it should register all endpoints in correct order", () => {
    const deps = buildDependencies();

    buildRouter(deps);

    const useCalls = mockRouter.use.mock.calls;
    expect(useCalls[0][0]).toBe(correlationMiddleware);
    expect(useCalls[1][0]).toBe("/api-docs");
    expect(useCalls[2][0]).toBe(authMiddleware);
    expect(useCalls[3][0]).toBe(errorHandler);
  });
});
