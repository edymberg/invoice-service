export interface InvoiceFailed {
  type: "InvoiceFailed";
  invoiceId: string;
  reason: string;
}
