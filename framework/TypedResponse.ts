import { Response } from "express";

export interface TypedResponse<Output> extends Response {
  json: (body: Output) => this;
}
