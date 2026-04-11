import yaml from "js-yaml";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerUi from "swagger-ui-express";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const openapiPath = path.join(__dirname, "../../../../../schemas/openapi.yaml");
const openapiYaml = fs.readFileSync(openapiPath, "utf8");
const swaggerDocument = yaml.load(openapiYaml) as swaggerUi.JsonObject;

export { swaggerDocument, swaggerUi };
