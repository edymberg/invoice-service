import { Request, Response, NextFunction } from "express";

export type CorrelationMiddleware = (req: Request, res: Response, next: NextFunction) => void;
