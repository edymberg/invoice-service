import { Mapper } from "../../../../../../../framework/mediator";
import { IssueInvoiceUseCaseOutput } from "../../../../../../domain/invoice/usecases/IssueInvoice";
import { CreateInvoiceEventResponseDTO } from "../../dtos/CreateInvoiceEventOutboundDTO";

export class FromUseCaseToEventMapper implements Mapper<
  IssueInvoiceUseCaseOutput,
  CreateInvoiceEventResponseDTO
> {
  public map(_dto: IssueInvoiceUseCaseOutput): CreateInvoiceEventResponseDTO {
    return null as unknown as CreateInvoiceEventResponseDTO;
  }
}
