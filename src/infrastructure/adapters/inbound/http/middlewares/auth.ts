import { Request, Response, NextFunction } from "express";

import { PinoLoggerFactory } from "../../../../../../framework/logging";
import { InvoiceServiceConfig } from "../../../../config/env";

export const authMiddlewareFactory = (invoiceServiceConfig: InvoiceServiceConfig) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const logger = PinoLoggerFactory.getLogger("AuthMiddleware");
    try {
      const authHeader = req.headers["authorization"];

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        logger.warn("Auth middleware detected unauthorized request");
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      const token = authHeader.substring("Bearer ".length);
      if (token !== invoiceServiceConfig.apiKey) {
        logger.warn("Auth middleware detected unauthorized request");
        res.status(401).json({ error: "Unauthorized" });
        return;
      }

      next();
    } catch (error) {
      logger.error(
        { err: error, correlationId: (req as any).correlationId },
        "Auth middleware error",
      );
      res.status(500).json({ error: "Internal Server Error" });
    }
  };
};
