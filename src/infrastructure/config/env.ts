enum NodeEnvironment {
  LOCAL = "local",
  DEV = "dev",
  STG = "stg",
  PROD = "prod",
}
function validateNodeEnv(env: string | undefined): NodeEnvironment {
  const defaultNodeEnv = NodeEnvironment.LOCAL;
  if (!env) {
    return defaultNodeEnv;
  }

  const validEnvironments = Object.values(NodeEnvironment);
  return validEnvironments.includes(env as NodeEnvironment)
    ? (env as NodeEnvironment)
    : defaultNodeEnv;
}

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

type EnvironmentVariables = {
  port: number;
  apiKey: string;
  nodeEnv: NodeEnvironment;
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

export const env: EnvironmentVariables = {
  port: parseInt(process.env.PORT ?? "3000", 10),
  apiKey: process.env.API_KEY ?? "",
  nodeEnv: validateNodeEnv(process.env.NODE_ENV),
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
// TODO: remove log config
