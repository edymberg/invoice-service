import pino from "pino";

import { env } from "../../src/infrastructure/config/env";

export type Logger = pino.Logger;

export const logger: Logger = pino({ level: env.log.rootLevel, base: null }) as Logger;

export class LoggerFactory {
  static getLogger(className: string): Logger {
    const level = env.log.innerClassesLevel?.[className] ?? env.log.rootLevel;

    return logger.child({ class: className, level });
  }
}
