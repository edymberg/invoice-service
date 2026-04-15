import { Response } from "express";

export interface TypedResponse<O> extends Response {
  json: (body: O) => this;
}
