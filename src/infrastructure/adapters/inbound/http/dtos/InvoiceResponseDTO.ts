export type InvoiceResponseDTO = {
  id: string;
  status: string;
  cae: string | null;
  caeVto: string | null;
  voucherNumber: number | null;
}