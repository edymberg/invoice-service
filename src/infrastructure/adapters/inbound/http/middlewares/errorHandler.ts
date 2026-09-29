import { NextFunction, Request, Response } from "express";

import { BusinessRuleViolation } from "../../../../../../framework/ddd/BusinessRule";
import { DTOMappingException } from "../../../../../../framework/http/DTOValidator";
import { PinoLoggerFactory } from "../../../../../../framework/logging";
import { ErrorResponseDTO } from "../dtos/ErrorResponseDTO";

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const logger = PinoLoggerFactory.getLogger("ErrorHandler");
  // TODO: have a req type with correlationId

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const correlationId = (req as any).correlationId;
  const message = err.message;

  switch (err.constructor) {
    case DTOMappingException:
      logger.warn({ correlationId, message, errors: err.error }, "DTO validation failed");
      const dtoValidationError: ErrorResponseDTO = mapToErrorResponseDTO(err, correlationId, 400);
      return res.status(dtoValidationError.status!).json(dtoValidationError);
    case BusinessRuleViolation:
      logger.warn({ correlationId, message }, "Business rule violation");
      const businessRuleError: ErrorResponseDTO = mapToErrorResponseDTO(err, correlationId, 422);
      return res.status(businessRuleError.status!).json(businessRuleError);
    default:
      logger.error(
        { err: { ...err, message, stack: err.stack }, correlationId },
        "Internal Server Error",
      );
      const errorResponse = {
        message: "Internal Server Error",
        correlationId,
        status: 500,
        details: [],
      };
      return res.status(errorResponse.status!).json(errorResponse);
  }
}

function mapToErrorResponseDTO(
  error: DTOMappingException | BusinessRuleViolation,
  id: string,
  statusCode: number,
): ErrorResponseDTO {
  return {
    message: error.message,
    correlationId: id,
    status: statusCode,
    details: error.error.map((detail) => ({
      code: detail.code,
      field: detail.path,
      message: detail.message,
    })),
  } as ErrorResponseDTO;
}
