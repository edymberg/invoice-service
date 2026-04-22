import { Router } from "express";

import { AfipController } from "./controllers/AfipController";
import { HealthController } from "./controllers/HealthController";
import { InvoiceController } from "./controllers/InvoiceController";
import { SalesPointsController } from "./controllers/SalesPointsController";
import { FromHttpToGetInvoiceRequestDTOMapper } from "./mappers/infra/FromHttpToGetInvoiceRequestDTOMapper";
import { FromHttpToInvoiceRequestDTOMapper } from "./mappers/infra/FromHttpToInvoiceRequestDTOMapper";
import { authMiddleware } from "./middlewares/auth";
import { correlationMiddleware } from "./middlewares/correlation";
import { errorHandler } from "./middlewares/errorHandler";
import {
  bodyMapperMiddleware,
  paramsMapperMiddleware,
  Swagger,
} from "../../../../../framework/http";

export function buildRouter(deps: {
  invoiceController: InvoiceController;
  afipController: AfipController;
  healthController: HealthController;
  salesPointsController: SalesPointsController;
  swagger: Swagger;
}) {
  const router = Router();

  router.use(correlationMiddleware);

  router.get("/health", deps.healthController.health);
  router.use("/api-docs", deps.swagger.serve(), deps.swagger.setup());

  router.use(authMiddleware);
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
        await deps.invoiceController.get(req, res);
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

  router.use(errorHandler);
  return router;
}
