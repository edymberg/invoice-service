import cors from "cors";
import express from "express";

import { buildDependencies } from "./di";
import { buildRouter } from "./infrastructure/adapters/inbound/http/routes";

export async function buildApp() {
  const app = express();
  app.use(cors());
  // TODO: security: cors allowlist, content-type, js/html injection prevention
  app.use(express.json());
  app.use(buildRouter(await buildDependencies()));
  return app;
}
