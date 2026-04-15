import { TypedRequest } from "../../../../../../framework/TypedRequest";
import { TypedResponse } from "../../../../../../framework/TypedResponse";
import { UseCaseHandler } from "../../../../../../framework/UseCaseHandler";
import { CreateInvoiceRequestDTO } from "../dtos/CreateInvoiceRequestDTO";
import { CreateInvoiceResponseDTO } from "../dtos/CreateInvoiceResponseDTO";
import { GetInvoiceRequestDTO } from "../dtos/GetInvoiceRequestDTO";
import { GetInvoiceResponseDTO } from "../dtos/GetInvoiceResponseDTO";

export class InvoiceController {
  constructor(
    private readonly getInvoiceHandler: UseCaseHandler<GetInvoiceRequestDTO, GetInvoiceResponseDTO>,
    private readonly issueInvoiceHandler: UseCaseHandler<
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
    const result: CreateInvoiceResponseDTO = await this.issueInvoiceHandler.handle(
      dto,
      idempotencyKey,
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
