import { Request, Response } from "express";
export class SalesPointsController {
  // TODO: Conectar a ARCA/AFIP para devolver puntos de venta (FEParamGetPtosVenta / método del SDK).
  list = async (_req: Request, res: Response) => {
    res
      .status(501)
      .json({ error: "Not Implemented", note: "TODO: Integrar FEParamGetPtosVenta via SDK" });
  };
}
