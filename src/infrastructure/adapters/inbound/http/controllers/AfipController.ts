import { Request, Response } from "express";
import { GetAfipStatusQuery } from "../../../../../business/usecases/GetAfipStatusQuery";

export class AfipController {
  constructor(private readonly statusQuery: GetAfipStatusQuery) {}
  status = async (_req: Request, res: Response) => {
    const status = await this.statusQuery.execute();
    res.json(status);
  };
}
