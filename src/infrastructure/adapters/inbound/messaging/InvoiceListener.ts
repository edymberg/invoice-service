import { CreateInvoiceEventInboundDTO } from "./dtos/CreateInvoiceEventInboundDTO";
import { CreateInvoiceEventOutboundDTO } from "./dtos/CreateInvoiceEventOutboundDTO";
import { UseCaseHandler } from "../../../../../framework/mediator";

class SQSListener {
  constructor() {}
}

export class InvoiceListener extends SQSListener {
  constructor(
    private readonly issueInvoiceHandler: UseCaseHandler<
      CreateInvoiceEventInboundDTO,
      CreateInvoiceEventOutboundDTO
    >,
  ) {
    super();
  }

  public async listen(invoiceEventDTO: CreateInvoiceEventInboundDTO) {
    await this.issueInvoiceHandler.handle(invoiceEventDTO, invoiceEventDTO.id);
  }
}
