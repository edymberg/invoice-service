import { AbstractDTOValidator, RestDTOError } from "../../../../../../../framework/http";
import { Mapper } from "../../../../../../../framework/mediator";
import { IssueInvoiceUseCaseInput } from "../../../../../../domain/invoice/usecases/IssueInvoice";
import { Day } from "../../../../../../domain/invoice/vo/Day";
import { Identification, DocumentType } from "../../../../../../domain/invoice/vo/Identification";
import { CreateInvoiceEventInputDTO } from "../../dtos/CreateInvoiceEventInboundDTO";

export class FromEventToUseCaseMapper
  extends AbstractDTOValidator
  implements Mapper<CreateInvoiceEventInputDTO, IssueInvoiceUseCaseInput>
{
  protected doValidations(_dto: unknown): RestDTOError {
    return [];
  }

  public map(dto: CreateInvoiceEventInputDTO): IssueInvoiceUseCaseInput {
    this.doValidations(dto);
    return {
      externalId: dto.externalId,
      amount: dto.amount,
      idDocument: Identification.builder().value(dto.idDocument!).type(DocumentType.DNI).build(),
      concept: dto.concept,
      serviceFrom: dto.serviceFrom
        ? Day.builder()
            .day(dto.serviceFrom.day)
            .month(dto.serviceFrom.month)
            .year(dto.serviceFrom.year)
            .build()
        : undefined,
      serviceTo: dto.serviceTo
        ? Day.builder()
            .day(dto.serviceTo.day)
            .month(dto.serviceTo.month)
            .year(dto.serviceTo.year)
            .build()
        : undefined,
      pointOfSale: dto.pointOfSale,
      idempotencyKey: dto.idempotencyKey,
    } as IssueInvoiceUseCaseInput;
  }
}
