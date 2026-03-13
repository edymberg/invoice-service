import { Invoice } from "../../../../../../domain/invoice/Invoice";
import { InvoiceResponseDTO } from "../../dtos/InvoiceResponseDTO";
import { Mapper } from "../../../../../../../framework/Mapper";

export class FromInvoiceToInvoiceResponseDTOMapper implements Mapper<Invoice, InvoiceResponseDTO> {
	public map(invoice: Invoice): InvoiceResponseDTO {
		return {
      id: invoice.id,
      status: invoice.status.toString(),
      cae: invoice.afip?.cae ?? null,
      caeVto: invoice.afip?.caeExpiration ?? null,
      voucherNumber: invoice.afip?.voucherNumber ?? null
    };
	}
}