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
    (req, res) => deps.invoiceController.create(req, res),
    deps.invoiceController.create,
  );
  router.get(
    "/invoices/:id",
    paramsMapperMiddleware(new FromHttpToGetInvoiceRequestDTOMapper()),
    deps.invoiceController.get,
  );
  router.get("/afip/status", deps.afipController.status);

  router.get("/sales-points", deps.salesPointsController.list);

  router.use(errorHandler);
  return router;
}
