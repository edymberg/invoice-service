import { Mapper } from "../../../../../../../framework/mediator";
import { GetInvoiceUseCaseOutput } from "../../../../../../domain/invoice/usecases/GetInvoice";
import { GetInvoiceResponseDTO } from "../../dtos/GetInvoiceResponseDTO";

// TODO: find a mapstruct like plugin to do this

export class FromGetInvoiceQueryToGetInvoiceResponseDTOMapper implements Mapper<
  GetInvoiceUseCaseOutput,
  GetInvoiceResponseDTO
> {
  public map(output: GetInvoiceUseCaseOutput): GetInvoiceResponseDTO {
    const invoice = output.invoice;
    if (!invoice) {
      throw new Error("Invoice not found");
    }
    return {
      id: invoice.id,
      externalId: invoice.externalId ?? null,
      status: invoice.status,
      pointOfSale: invoice.pointOfSaleValue(),
      voucherType: invoice.voucherType,
      concept: invoice.conceptValue(),
      documentType: invoice.docType(),
      documentNumber: invoice.docNumber(),
      date: `${invoice.date.date.year}-${String(invoice.date.date.month).padStart(2, "0")}-${String(invoice.date.date.day).padStart(2, "0")}`,
      amount: invoice.totalAmount(),
      currency: invoice.currency(),
      serviceFrom: invoice.serviceFrom
        ? `${invoice.serviceFrom.date.year}-${String(invoice.serviceFrom.date.month).padStart(2, "0")}-${String(invoice.serviceFrom.date.day).padStart(2, "0")}`
        : null,
      serviceTo: invoice.serviceTo
        ? `${invoice.serviceTo.date.year}-${String(invoice.serviceTo.date.month).padStart(2, "0")}-${String(invoice.serviceTo.date.day).padStart(2, "0")}`
        : null,
      cae: invoice.afip?.cae ?? null,
      caeVto: invoice.afip?.caeExpiration ?? null,
      voucherNumber: invoice.afip?.voucherNumber ?? null,
    } as GetInvoiceResponseDTO;
  }
}
