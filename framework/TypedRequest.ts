import { Request } from "express";

export interface TypedRequest<
  Body = unknown,
  Params extends Record<string, string> = Record<string, string>,
> extends Request {
  params: Params;
  body: Body;
}
