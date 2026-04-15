import { Mapper } from "./Mapper";
import { UseCaseHandler } from "./UseCaseHandler";
import { Request, Response } from "express";

export class Controller {
  constructor(
    private readonly infaMapper: Mapper<JSON, RequestDTO>,
    private readonly handler: UseCaseHandler<RequestDTO, ResponseDTO>,
  ) {}
}

export interface MyRequest<I> extends Request {
  body: I;
}

// TODO: find a way to map the given JSON to the desired DTO using this framework and the infraMapper.