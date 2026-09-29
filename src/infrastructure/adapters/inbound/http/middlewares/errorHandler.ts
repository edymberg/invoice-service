import { NextFunction, Request, Response } from "express";

import { BusinessRuleViolation } from "../../../../../../framework/ddd/BusinessRule";
import { DTOMappingException } from "../../../../../../framework/http/DTOValidator";
import { PinoLoggerFactory } from "../../../../../../framework/logging";
import { ErrorResponseDTO } from "../dtos/ErrorResponseDTO";

// TODO: return ErrorResponseDTO

// eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  const logger = PinoLoggerFactory.getLogger("ErrorHandler");
  // TODO: have a req type with correlationId

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const correlationId = (req as any).correlationId;
  const message = err.message;

  switch (err.constructor) {
    case DTOMappingException:
      // Handle DTOMappingException (400 Bad Request)
      logger.warn({ correlationId, message, errors: err.restDTOError }, "DTO validation failed");
      const dtoValidationError: ErrorResponseDTO = mapValidationError(err, correlationId);
      return res.status(dtoValidationError.status!).json(dtoValidationError);
    case BusinessRuleViolation:
      // Handle BusinessRuleViolation (422 Unprocessable Entity)
      logger.warn({ correlationId, message }, "Business rule violation");
      const businessRuleError: ErrorResponseDTO = mapBusinessRuleViolation(err, correlationId);
      return res.status(businessRuleError.status!).json(businessRuleError);
    default:
      // Handle generic errors
      logger.error({ err: { ...err, message, stack: err.stack }, correlationId }, "Internal Server Error");
      const errorResponse = {
        message: "Internal Server Error",
        correlationId,
        status: 500,
        details: [],
      };
      return res.status(errorResponse.status!).json(errorResponse);
  }
}


function mapValidationError(error: DTOMappingException, id: string): ErrorResponseDTO {
  return {
    message: error.message,
    correlationId: id,
    status: 400,
    details: error.restDTOError.map(detail => ({
      code: detail.code,
      field: detail.path,
      message: detail.message,
    })),
  } as ErrorResponseDTO;
}

function mapBusinessRuleViolation(error: BusinessRuleViolation, id: string): ErrorResponseDTO {
  return {
    message: error.message,
    correlationId: id,
    status: 422,
    details: error.error.map(detail => ({
      code: detail.code,
      field: detail.path,
      message: detail.message,
    })),
  } as ErrorResponseDTO;
}
