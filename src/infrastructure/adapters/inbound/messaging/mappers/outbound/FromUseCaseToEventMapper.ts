import { Mapper } from "../../../../../../../framework/mediator";
import { IssueInvoiceUseCaseOutput } from "../../../../../../domain/invoice/usecases/IssueInvoice";
import type { CreateInvoiceEventOutboundDTO } from "../../dtos/CreateInvoiceEventOutboundDTO";

export class FromUseCaseToEventMapper implements Mapper<
  IssueInvoiceUseCaseOutput,
  CreateInvoiceEventOutboundDTO
> {
  public map(_dto: IssueInvoiceUseCaseOutput): CreateInvoiceEventOutboundDTO {
    return null as unknown as CreateInvoiceEventOutboundDTO;
  }
}
