export interface InvoiceIssued {
  type: "InvoiceIssued";
  invoiceId: string;
  cae: string;
  caeExpiration: string; // yyyy-mm-dd
  voucherNumber: number;
}
