import { Router } from "express";

import { AfipController } from "./controllers/AfipController";
import { HealthController } from "./controllers/HealthController";
import { InvoiceController } from "./controllers/InvoiceController";
import { SalesPointsController } from "./controllers/SalesPointsController";
import { GetInvoiceRequestDTO } from "./dtos/GetInvoiceRequestDTO";
import { FromHttpToGetInvoiceRequestDTOMapper } from "./mappers/infra/FromHttpToGetInvoiceRequestDTOMapper";
import { FromHttpToInvoiceRequestDTOMapper } from "./mappers/infra/FromHttpToInvoiceRequestDTOMapper";
import { authMiddlewareFactory } from "./middlewares/auth";
import {
  bodyMapperMiddleware,
  paramsMapperMiddleware,
  Swagger,
  TypedRequest,
  CorrelationMiddleware,
  ErrorHandlerMiddleware,
} from "../../../../../framework/http";
import { InvoiceServiceConfig } from "../../../config/env";

export function buildRouter(
  deps: {
    invoiceController: InvoiceController;
    afipController: AfipController;
    healthController: HealthController;
    salesPointsController: SalesPointsController;
    swagger: Swagger;
    correlationMiddleware: CorrelationMiddleware;
    errorHandler: ErrorHandlerMiddleware;
  },
  invoiceServiceConfig: InvoiceServiceConfig,
) {
  const router = Router();

  router.use(deps.correlationMiddleware);

  router.get("/health", deps.healthController.health);
  router.use("/api-docs", deps.swagger.serve(), deps.swagger.setup());

  router.use(authMiddlewareFactory(invoiceServiceConfig));
  router.post(
    "/invoices",
    bodyMapperMiddleware(new FromHttpToInvoiceRequestDTOMapper()),
    // TODO: extraer a parte del framework para ocultar express
    async (req, res, next) => {
      try {
        await deps.invoiceController.create(req, res);
      } catch (error) {
        next(error);
      }
    },
  );
  router.get(
    "/invoices/:id",
    paramsMapperMiddleware(new FromHttpToGetInvoiceRequestDTOMapper()),
    async (req, res, next) => {
      try {
        await deps.invoiceController.get(req as TypedRequest<null, GetInvoiceRequestDTO>, res);
      } catch (error) {
        next(error);
      }
    },
  );
  router.get("/afip/status", async (req, res, next) => {
    try {
      await deps.afipController.status(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.get("/sales-points", async (req, res, next) => {
    try {
      await deps.salesPointsController.list(req, res);
    } catch (error) {
      next(error);
    }
  });

  router.use(deps.errorHandler);
  return router;
}
