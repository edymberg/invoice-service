import { Request, Response } from "express";

import { Mapper } from "../../../../../../framework/Mapper";
import { UseCaseHandler } from "../../../../../../framework/UseCaseHandler";
import { GetInvoiceQuery } from "../../../../../business/usecases/GetInvoiceQuery";
import { InvoiceRequestDTO } from "../dtos/InvoiceRequestDTO";
import { InvoiceResponseDTO } from "../dtos/InvoiceResponseDTO";

export class InvoiceController {
  constructor(
    private readonly getInvoice: GetInvoiceQuery,
    private readonly infaMapper: Mapper<JSON, InvoiceRequestDTO>,
    private readonly invoiceHandler: UseCaseHandler<InvoiceRequestDTO, InvoiceResponseDTO>,
  ) {}

  public async create(req: Request, res: Response) {
    const body: JSON = req.body;
    const invoiceDTO: InvoiceRequestDTO = this.infaMapper.map(body);
    const idk = (req.headers["idempotency-key"] as string) || undefined;

    const invoiceResponseDTO = this.invoiceHandler.handle(invoiceDTO, idk);

    res.status(201).json(invoiceResponseDTO);
  }

  public async get(req: Request, res: Response) {
    const inv = await this.getInvoice.execute(req.params.id);
    res.json(inv);
  }
}
