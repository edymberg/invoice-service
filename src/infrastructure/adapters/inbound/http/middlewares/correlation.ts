import { Request, Response, NextFunction } from "express";
import { v4 as uuidv4 } from "uuid";

export function correlationMiddleware(req: Request, res: Response, next: NextFunction) {
  const id = (req.headers["x-correlation-id"] as string) || uuidv4();
  res.setHeader("x-correlation-id", id);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (req as any).correlationId = id;
  next();
}
