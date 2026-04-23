import pino from "pino";

import { EnvironmentVariables, LogConfig } from "../config";

export type Logger = object; // Base interface for all loggers

export type PinoLogger = pino.Logger & Logger;

// TODO: test that always returns the same logger instance
export class PinoLoggerFactory {
  private static logger: PinoLogger;
  private static config: LogConfig;

  static configureLogger(env: EnvironmentVariables): void {
    this.config = { ...env.log };
    this.logger = pino({ level: this.config.rootLevel, base: null }) as PinoLogger;
  }

  static getLogger(className: string): PinoLogger {
    const level = this.config.innerClassesLevel?.[className] ?? this.config.rootLevel;

    return PinoLoggerFactory.logger.child({ class: className, level });
  }
}
