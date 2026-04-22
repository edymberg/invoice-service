import { NextFunction, Request, Response } from "express";

import { BusinessRuleViolation } from "../../../../../../framework/ddd/BusinessRuleViolation";
import { DTOMappingException } from "../../../../../../framework/http/DTOValidator";
import { PinoLoggerFactory } from "../../../../../../framework/logging";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const logger = PinoLoggerFactory.getLogger("ErrorHandler");
  // TODO: have a req type with correlationId
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const id = (req as any).correlationId;

  // Handle DTOMappingException (400 Bad Request)
  if (err instanceof DTOMappingException) {
    logger.warn({ correlationId: id, errors: err.restDTOError }, "DTO validation failed");
    return res.status(400).json({
      error: "Validation failed",
      details: err.restDTOError,
      correlationId: id,
    });
  }

  // Handle BusinessRuleViolation (422 Unprocessable Entity)
  if (err instanceof BusinessRuleViolation) {
    const msg = err.message.replace(/\b(\d{4,8})\b/g, "***");
    logger.warn({ correlationId: id, message: msg }, "Business rule violation");
    return res.status(422).json({
      error: msg,
      correlationId: id,
    });
  }

  // Handle generic errors
  const msg = (err?.message ?? "Internal Server Error").replace(/\b(\d{4,8})\b/g, "***");
  logger.error({ err: { ...err, message: msg }, correlationId: id }, "Unhandled error");
  const status = err.statusCode ?? 500;
  res.status(status).json({ error: msg, correlationId: id });
}
