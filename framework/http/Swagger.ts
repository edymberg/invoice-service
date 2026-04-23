import yaml from "js-yaml";
import fs from "node:fs";
import path from "node:path";
import swaggerUi from "swagger-ui-express";

import { PinoLogger, PinoLoggerFactory } from "../logging";

export class Swagger {
  public static EXPECTED_OPENAPI_PATH = "schemas/openapi.yaml";

  private readonly logger: PinoLogger = PinoLoggerFactory.getLogger("Swagger");
  private readonly swaggerDocument: swaggerUi.JsonObject;

  constructor() {
    const resolvedPath = path.join(process.cwd(), Swagger.EXPECTED_OPENAPI_PATH);

    if (!fs.existsSync(resolvedPath)) {
      throw new Error(
        `OpenAPI specification file not found.\n` +
          `Expected location: ${resolvedPath}\n` +
          `The file must be located at: ./${Swagger.EXPECTED_OPENAPI_PATH} (relative to project root)\n` +
          `Current working directory: ${process.cwd()}`,
      );
    }

    const openapiYaml = fs.readFileSync(resolvedPath, "utf8");
    this.swaggerDocument = yaml.load(openapiYaml) as swaggerUi.JsonObject;
    this.logger.info("Swagger UI loaded at: http://localhost:3000/api-docs");
  }

  public serve() {
    return swaggerUi.serve;
  }

  public setup() {
    return swaggerUi.setup(this.swaggerDocument);
  }
}
