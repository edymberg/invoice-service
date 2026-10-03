import { NextFunction, Request, Response } from "express";

import { BusinessRuleViolation } from "../../ddd/BusinessRule";
import { DTOMappingException } from "../../http/DTOValidator";
import { PinoLoggerFactory } from "../../logging";
import type { ErrorHandlerMiddleware } from "../types/ErrorHandlerMiddleware";
import { ErrorResponseDTO } from "../types/ErrorResponseDTO";

export const errorHandler: ErrorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  _: NextFunction,
): Response => {
  const logger = PinoLoggerFactory.getLogger("ErrorHandler");
  // TODO: have a req type with correlationId

  const correlationId = (req as any).correlationId;
  const message = err.message;

  switch (err.constructor) {
    case DTOMappingException:
      return handleDTOMappingException(err, correlationId, res);
    case BusinessRuleViolation:
      return handleBusinessRuleViolation(err, correlationId, res);
    default:
      logger.error(
        { err: { ...err, message, stack: err.stack }, correlationId },
        "Internal Server Error",
      );
      const errorResponse: ErrorResponseDTO = {
        message: "Internal Server Error",
        correlationId,
        status: 500,
        details: [],
      };
      return res.status(errorResponse.status!).json(errorResponse);
  }
};

function handleBusinessRuleViolation(
  err: BusinessRuleViolation,
  correlationId: string,
  res: Response,
): Response {
  return genericHandleException(err, correlationId, "Business rule violation", 422, res);
}

function handleDTOMappingException(
  err: DTOMappingException,
  correlationId: string,
  res: Response,
): Response {
  return genericHandleException(err, correlationId, "DTO validation failed", 400, res);
}

function genericHandleException(
  err: DTOMappingException | BusinessRuleViolation,
  correlationId: string,
  message: string,
  statusCode: number,
  res: Response,
): Response {
  const logger = PinoLoggerFactory.getLogger("ErrorHandler");
  logger.warn({ correlationId, message: err.message, errors: err.error }, message);
  const errorResponseDTO: ErrorResponseDTO = mapToErrorResponseDTO(err, correlationId, statusCode);
  return res.status(errorResponseDTO.status!).json(errorResponseDTO);
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
  };
}
