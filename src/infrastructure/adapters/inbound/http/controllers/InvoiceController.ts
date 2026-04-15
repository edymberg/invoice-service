import { Request, Response } from "express";

import { TypedRequest } from "../../../../../../framework/TypedRequest";
import { TypedResponse } from "../../../../../../framework/TypedResponse";
import { UseCaseHandler } from "../../../../../../framework/UseCaseHandler";
import { GetInvoiceQuery } from "../../../../../business/usecases/GetInvoiceQuery";
import { CreateInvoiceRequestDTO, CreateInvoiceResponseDTO } from "../generated/api-types";

export class InvoiceController {
  constructor(
    private readonly getInvoice: GetInvoiceQuery,
    private readonly invoiceHandler: UseCaseHandler<
      CreateInvoiceRequestDTO,
      CreateInvoiceResponseDTO
    >,
  ) {}

  public async create(
    req: TypedRequest<CreateInvoiceRequestDTO>,
    res: TypedResponse<CreateInvoiceResponseDTO>,
  ) {
    const dto = req.body;
    const idempotencyKey = (req.headers["idempotency-key"] as string) || undefined;
    const result: CreateInvoiceResponseDTO = await this.invoiceHandler.handle(dto, idempotencyKey);
    res.status(201).json(result);
  }

  public async get(req: Request, res: Response) {
    const result = await this.getInvoice.execute(req.params.id);
    res.json(result);
  }
}
