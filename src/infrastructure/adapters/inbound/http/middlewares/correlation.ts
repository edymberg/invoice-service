import { v4 as uuid } from "uuid";
import { Request, Response, NextFunction } from "express";

export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers["x-correlation-id"] as string) || uuid();
  res.setHeader("x-correlation-id", id);
  (req as any).correlationId = id;
  next();
}
