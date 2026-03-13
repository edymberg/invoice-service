import { Router } from "express";
import { authMiddleware } from "./middlewares/auth";
import { correlationMiddleware } from "./middlewares/correlation";
import { errorHandler } from "./middlewares/errorHandler";
import { InvoiceController } from "./controllers/InvoiceController";
import { AfipController } from "./controllers/AfipController";
import { HealthController } from "./controllers/HealthController";
import { SalesPointsController } from "./controllers/SalesPointsController";

export function buildRouter(deps: {
  invoiceController: InvoiceController;
  afipController: AfipController;
  healthController: HealthController;
  salesPointsController: SalesPointsController;
}) {
  const router = Router();
  router.use(correlationMiddleware);

  router.get("/health", deps.healthController.health);

  router.use(authMiddleware);
  router.post("/invoices", deps.invoiceController.create);
  router.get("/invoices/:id", deps.invoiceController.get);
  router.get("/afip/status", deps.afipController.status);

  router.get("/sales-points", deps.salesPointsController.list);

  router.use(errorHandler);
  return router;
}
