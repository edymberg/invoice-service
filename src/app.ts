import cors from "cors";
import express from "express";

import { buildDependencies } from "./di";
import { buildRouter } from "./infrastructure/adapters/inbound/http/routes";
import { InvoiceServiceConfig } from "./infrastructure/config/env";

export type App = express.Application;

export async function buildApp(invoiceServiceConfig: InvoiceServiceConfig): Promise<App> {
  const app: App = express();
  app.use(cors());
  // TODO: security: cors allowlist, content-type, js/html injection prevention
  app.use(express.json());
  app.use(buildRouter(await buildDependencies(invoiceServiceConfig), invoiceServiceConfig));
  return app;
}
