export interface AfipVoucherInfo {
  cae?: string;
  caeExpiration?: string; // yyyy-mm-dd
  voucherNumber?: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  afipResponse?: any; // para auditoría
}
