import { NextFunction, Request, Response } from "express";

export type ErrorHandlerMiddleware = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => Response;
