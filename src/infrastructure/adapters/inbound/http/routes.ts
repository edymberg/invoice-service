import { Router } from "express";

import { AfipController } from "./controllers/AfipController";
import { HealthController } from "./controllers/HealthController";
import { InvoiceController } from "./controllers/InvoiceController";
import { SalesPointsController } from "./controllers/SalesPointsController";
import { FromHttpToInvoiceRequestDTOMapper } from "./mappers/infra/FromHttpToInvoiceRequestDTOMapper";
import { authMiddleware } from "./middlewares/auth";
import { correlationMiddleware } from "./middlewares/correlation";
import { errorHandler } from "./middlewares/errorHandler";
import { bodyMapperMiddleware } from "../../../../../framework/bodyMapper";

export function buildRouter(deps: {
  invoiceController: InvoiceController;
  afipController: AfipController;
  healthController: HealthController;
  salesPointsController: SalesPointsController;
  swagger: any;
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
  );
  router.get("/invoices/:id", (req, res) => deps.invoiceController.get(req, res));
  router.get("/afip/status", deps.afipController.status);

  router.get("/sales-points", deps.salesPointsController.list);

  router.use(errorHandler);
  return router;
}
