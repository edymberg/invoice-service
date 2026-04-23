import { EnvironmentVariables, buildEnvironmentVariables } from "../../../framework/config";

enum ArcaEnvironment {
  LOCAL = "local",
  DEV = "dev",
  PROD = "prod",
}
function validateArcaEnv(env: string | undefined): ArcaEnvironment {
  const defaultArcaEnv = ArcaEnvironment.LOCAL;
  if (!env) {
    return defaultArcaEnv;
  }

  const validEnvironments = Object.values(ArcaEnvironment);
  return validEnvironments.includes(env as ArcaEnvironment)
    ? (env as ArcaEnvironment)
    : defaultArcaEnv;
}

export type InvoiceServiceConfig = EnvironmentVariables & {
  apiKey: string;
  mongo: {
    uri: string;
    db: string;
  };
  arca: {
    environment: ArcaEnvironment;
    accessToken: string;
    cuit: number;
    cert: string;
    key: string;
  };
};

function buildInvoiceServiceConfig(): InvoiceServiceConfig {
  return {
    ...buildEnvironmentVariables(),
    apiKey: process.env.API_KEY ?? "your_api_key_here",
    mongo: {
      uri: process.env.MONGO_URI ?? "mongodb://localhost:27017",
      db: process.env.MONGO_DB ?? "invoicing",
    },
    arca: {
      environment: validateArcaEnv(process.env.ARCA_ENV),
      accessToken: process.env.ARCA_ACCESS_TOKEN ?? "",
      cuit: parseInt(process.env.ARCA_CUIT ?? "20409378472", 10),
      cert: process.env.ARCA_CERT ?? "",
      key: process.env.ARCA_KEY ?? "",
    },
  };
}

export { buildInvoiceServiceConfig };
