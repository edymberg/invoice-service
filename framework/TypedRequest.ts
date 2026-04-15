import { Request } from "express";

export interface TypedRequest<I> extends Request {
  body: I;
}
