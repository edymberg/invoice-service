import { TypedRequest, TypedResponse } from "../../../../../../framework/http";
import { UseCaseHandler } from "../../../../../../framework/mediator";
import { CreateInvoiceRequestDTO } from "../dtos/CreateInvoiceRequestDTO";
import { CreateInvoiceResponseDTO } from "../dtos/CreateInvoiceResponseDTO";
import { GetInvoiceRequestDTO } from "../dtos/GetInvoiceRequestDTO";
import { GetInvoiceResponseDTO } from "../dtos/GetInvoiceResponseDTO";

export class InvoiceController {
  constructor(
    private readonly issueInvoiceHandler: UseCaseHandler<
      CreateInvoiceRequestDTO,
      CreateInvoiceResponseDTO
    >,
    private readonly getInvoiceHandler: UseCaseHandler<GetInvoiceRequestDTO, GetInvoiceResponseDTO>,
  ) {}

  public async create(
    req: TypedRequest<CreateInvoiceRequestDTO>,
    res: TypedResponse<CreateInvoiceResponseDTO>,
  ) {
    const result: CreateInvoiceResponseDTO = await this.issueInvoiceHandler.handle(
      req.body,
      (req.headers["idempotency-key"] as string) || undefined,
    );
    res.status(201).json(result);
  }

  public async get(
    req: TypedRequest<null, GetInvoiceRequestDTO>,
    res: TypedResponse<GetInvoiceResponseDTO>,
  ) {
    const invoice = await this.getInvoiceHandler.handle(req.params);
    if (!invoice) {
      res.status(404).send();
      return;
    }
    res.json(invoice);
  }
}
