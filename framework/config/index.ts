/** LOG ENV */
const INNER_CLASSES_LOG_LEVEL_PREFIX: string = "LOG_LEVEL_";

enum LogLevel {
  TRACE = "trace",
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}
export type LogConfig = {
  rootLevel: LogLevel;
  innerClassesLevel?: Record<string, LogLevel>;
};
function validateLogLevel(level: string | undefined): LogLevel {
  const defaultLogLevel = LogLevel.INFO;
  if (!level) {
    console.warn("LOG_LEVEL environment variable is not set, using INFO as default");
    return defaultLogLevel;
  }

  const validLevels = Object.values(LogLevel);
  if (!validLevels.includes(level.toLowerCase() as LogLevel)) {
    console.warn(`Invalid LOG_LEVEL value: ${level}, using INFO as default`);
    return defaultLogLevel;
  }
  return level as LogLevel;
}

function parseInnerClassesLogLevels(env: NodeJS.ProcessEnv): Record<string, LogLevel> {
  const innerClassesLevel: Record<string, LogLevel> = {};

  const innerClassesLogLevels: string[] = Object.keys(env).filter(
    (key) => key.startsWith(INNER_CLASSES_LOG_LEVEL_PREFIX) && key !== "LOG_LEVEL",
  );

  innerClassesLogLevels.forEach((key) => {
    const className = key
      .substring(INNER_CLASSES_LOG_LEVEL_PREFIX.length)
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join("");

    const logLevel = validateLogLevel(process.env[key]?.toLowerCase());
    console.warn(`Detected Log Level ${logLevel} configuration for inner class: ${className}`);
    innerClassesLevel[className] = logLevel;
  });

  return innerClassesLevel;
}

/** NODE ENV */
export enum NodeEnvironment {
  TEST = "test",
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

export function isEnv(env: NodeEnvironment): boolean {
  return process.env.NODE_ENV === env;
}

/** ENV */
export type EnvironmentVariables = {
  port: number;
  nodeEnv: NodeEnvironment;
  log: LogConfig;
};

export function buildEnvironmentVariables(): EnvironmentVariables {
  return {
    port: parseInt(process.env.PORT ?? "3000", 10),
    nodeEnv: validateNodeEnv(process.env.NODE_ENV),
    log: {
      rootLevel: validateLogLevel(process.env.LOG_LEVEL),
      innerClassesLevel: parseInnerClassesLogLevels(process.env),
    },
  };
}
