import { Mapper } from "../../../../../../../framework/Mapper";
import { IssueInvoiceUseCaseOutput } from "../../../../../../domain/invoice/usecases/IssueInvoice";
import { CreateInvoiceResponseDTO } from "../../dtos/CreateInvoiceResponseDTO";

// TODO: find a mapstruct like plugin to do this

export class FromIssueInvoiceUseCaseOutputToCreateInvoiceResponseDTOMapper implements Mapper<
  IssueInvoiceUseCaseOutput,
  CreateInvoiceResponseDTO
> {
  public map(output: IssueInvoiceUseCaseOutput): CreateInvoiceResponseDTO {
    return {
      id: output.invoice.id,
      status: output.invoice.status.toString() as "Draft" | "Issuing" | "Issued" | "Failed",
      cae: output.invoice.afip?.cae ?? null,
      caeVto: output.invoice.afip?.caeExpiration ?? null,
      voucherNumber: output.invoice.afip?.voucherNumber ?? null,
    };
  }
}
