import { Request, Response, NextFunction, RequestHandler } from "express";

// TODO: Review this import, is a dependency from other module. Those modules should be a single module.
import { Mapper } from "../../hexagonal";
import { TypedRequest } from "../index";

// T es un tipo generico que representa un DTO.
// Por cuestiones de simplicidad no se ha generado aun el tipo BodyDTO.
export function bodyMapperMiddleware<T>(mapper: Mapper<unknown, T>): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const body: TypedRequest = req.body;
      const mappedBody: T = mapper.map(body);
      req.body = mappedBody;
      next();
    } catch (error) {
      next(error);
    }
  };
}
// T es un tipo generico que representa un DTO, especificamente un objeto con strings como valores.
// Por cuestiones de simplicidad no se ha generado aun el tipo ParamsDTO.
export function paramsMapperMiddleware<T extends Record<string, string>>(
  mapper: Mapper<unknown, T>,
): RequestHandler {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const params: Record<string, string> = req.params;
      const mappedParams: T & Record<string, string> = mapper.map(params);
      req.params = mappedParams;
      next();
    } catch (error) {
      next(error);
    }
  };
}
