import { Request, Response, NextFunction, RequestHandler } from "express";

import { Mapper } from "./Mapper";

export function bodyMapperMiddleware<T>(mapper: Mapper<unknown, T>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      req.body = mapper.map(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
}
