import { Mapper } from "../../../../../../../framework/Mapper";
import { IssueInvoiceUseCaseOutput } from "../../../../../../domain/invoice/usecases/IssueInvoice";
import { InvoiceResponseDTO } from "../../dtos/InvoiceResponseDTO";

export class FromIssueInvoiceUseCaseOutputToInvoiceResponseDTOMapper implements Mapper<
  IssueInvoiceUseCaseOutput,
  InvoiceResponseDTO
> {
  public map(output: IssueInvoiceUseCaseOutput): InvoiceResponseDTO {
    return {
      id: output.invoice.id,
      status: output.invoice.status.toString(),
      cae: output.invoice.afip?.cae ?? null,
      caeVto: output.invoice.afip?.caeExpiration ?? null,
      voucherNumber: output.invoice.afip?.voucherNumber ?? null,
    };
  }
}
