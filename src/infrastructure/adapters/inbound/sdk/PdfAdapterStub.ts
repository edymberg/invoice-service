import { PdfPort } from "../../../../business/ports/PdfPort";
export class PdfAdapterStub implements PdfPort {
  async render(invoice: {
    id: string;
    cae: string;
    caeVto: string;
    voucherNumber: number;
    amount: number;
    date: number;
    docTipo: number;
    docNro: number;
    ptoVta: number;
    cbteTipo: number;
    qrUrl?: string;
  }): Promise<Buffer> {
    const content = `
FACTURA C (CbteTipo=${invoice.cbteTipo})
ID: ${invoice.id}
PTOVTA: ${invoice.ptoVta} - NRO: ${invoice.voucherNumber}
FECHA: ${invoice.date}
DOC: ${invoice.docTipo}-${invoice.docNro}
TOTAL: $ ${invoice.amount.toFixed(2)}
CAE: ${invoice.cae} (Vto: ${invoice.caeVto})
QR: ${invoice.qrUrl ?? "-"}
`;
    return Buffer.from(content, "utf-8");
  }
}
