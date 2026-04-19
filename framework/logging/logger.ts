import pino from "pino";

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

export type PinoLogger = pino.Logger;

export const INNER_CLASSES_LOG_LEVEL_PREFIX: string = "LOG_LEVEL_";

export function validateLogLevel(level: string | undefined): LogLevel {
  const defaultLogLevel = LogLevel.INFO;
  if (!level) {
    console.warn("LOG_LEVEL environment variable is not set, using INFO as default");
    return defaultLogLevel;
  }

  const validLevels = Object.values(LogLevel);
  if (!validLevels.includes(level as LogLevel)) {
    console.warn(`Invalid LOG_LEVEL value: ${level}, using INFO as default`);
    return defaultLogLevel;
  }
  return level as LogLevel;
}

export function parseInnerClassesLogLevels(env: NodeJS.ProcessEnv): Record<string, LogLevel> {
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
    console.warn(`Detected Log Level configuration for inner class: ${className}`);

    const logLevel = validateLogLevel(process.env[key]?.toLowerCase());
    innerClassesLevel[className] = logLevel;
  });

  return innerClassesLevel;
}

export class PinoLoggerFactory {
  private static INNER_CLASSES_LOG_LEVEL_PREFIX: string = "LOG_LEVEL_";
  private static logger: PinoLogger;
  private static config: LogConfig;

  private static validateLogLevel(level: string | undefined): LogLevel {
    const defaultLogLevel = LogLevel.INFO;
    if (!level) {
      console.warn("LOG_LEVEL environment variable is not set, using INFO as default");
      return defaultLogLevel;
    }

    const validLevels = Object.values(LogLevel);
    if (!validLevels.includes(level as LogLevel)) {
      console.warn(`Invalid LOG_LEVEL value: ${level}, using INFO as default`);
      return defaultLogLevel;
    }
    return level as LogLevel;
  }

  private static parseInnerClassesLogLevels(env: NodeJS.ProcessEnv): Record<string, LogLevel> {
    const innerClassesLevel: Record<string, LogLevel> = {};

    const innerClassesLogLevels: string[] = Object.keys(env).filter(
      (key) => key.startsWith(this.INNER_CLASSES_LOG_LEVEL_PREFIX) && key !== "LOG_LEVEL",
    );

    innerClassesLogLevels.forEach((key) => {
      const className = key
        .substring(this.INNER_CLASSES_LOG_LEVEL_PREFIX.length)
        .split("_")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join("");
      console.warn(`Detected Log Level configuration for inner class: ${className}`);

      const logLevel = this.validateLogLevel(process.env[key]?.toLowerCase());
      innerClassesLevel[className] = logLevel;
    });

    return innerClassesLevel;
  }

  static configureLogger(env: NodeJS.ProcessEnv): void {
    this.config = {
      rootLevel: this.validateLogLevel(env.LOG_LEVEL),
      innerClassesLevel: this.parseInnerClassesLogLevels(env),
    };
    this.logger = pino({ level: this.config.rootLevel, base: null }) as PinoLogger;
  }

  static getLogger(className: string): PinoLogger {
    const level = this.config.innerClassesLevel?.[className] ?? this.config.rootLevel;

    return PinoLoggerFactory.logger.child({ class: className, level });
  }
}
