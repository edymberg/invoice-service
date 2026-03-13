import { Request, Response, NextFunction } from "express";
import { logger } from "../../../../logging/logger";

// TODO: handle DTOMappingException and Domain Exceptions

export function errorHandler(err: any, req: Request, res: Response, _next: NextFunction) {
  const id = (req as any).correlationId;
  // Sanitizar posible DNI en el mensaje
  const msg = (err?.message ?? "Internal Server Error").replace(/\b(\d{4,8})\b/g, "***");
  logger.error({ err: { ...err, message: msg }, correlationId: id }, "Unhandled error");
  const status = err.statusCode ?? 500;
  res.status(status).json({ error: msg, correlationId: id });
}
