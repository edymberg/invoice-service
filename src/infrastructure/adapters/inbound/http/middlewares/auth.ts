import { Request, Response, NextFunction } from "express";

import { logger } from "../../../../../../framework/logging/logger";
import { env } from "../../../../config/env";

export const authMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  try {
    const authHeader = req.headers["authorization"];

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      const token = authHeader.substring("Bearer ".length);
      if (token !== env.apiKey) {
        res.status(401).json({ error: "Unauthorized" });
      }
      next();
    }
  } catch (error) {
    logger.error(
      { err: error, correlationId: (req as any).correlationId },
      "Auth middleware error",
    );
    res.status(500).json({ error: "Internal Server Error" });
  }
};
