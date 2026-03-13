import { Request, Response } from "express";
import { GetInvoiceQuery } from "../../../../../business/usecases/GetInvoiceQuery";
import { FromHttpToInvoiceRequestDTOMapper } from "../mappers/infra/FromHttpToInvoiceRequestDTOMapper";
import { InvoiceRequestDTO } from "../dtos/InvoiceRequestDTO";
import { InvoiceResponseDTO } from "../dtos/InvoiceResponseDTO";
import { UseCaseHandler } from "../../../../../../framework/UseCaseHandler";

export class InvoiceController {
  constructor(
    private readonly getInvoice: GetInvoiceQuery,
    private readonly infaMapper: FromHttpToInvoiceRequestDTOMapper,
    private readonly invoiceHandler: UseCaseHandler<InvoiceRequestDTO, InvoiceResponseDTO>,
  ) {}

  // TODO: find a pluging like the one for the open-api in maven to build the controller
  //  And the DTOs (infra layer) (in-out should be in a mapstruct like library)
  public async create(req: Request, res: Response) { 
    const invoiceDTO: InvoiceRequestDTO = this.infaMapper.map(req.body); // TODO: move this as a middleware
    const idk = (req.headers["idempotency-key"] as string) || undefined;

    const invoiceResponseDTO = this.invoiceHandler.handle(invoiceDTO, idk);

    res.status(201).json(invoiceResponseDTO);
  };
  
  get = async (req: Request, res: Response) => {
    const inv = await this.getInvoice.execute(req.params.id);
    res.json(inv);
  };
}
