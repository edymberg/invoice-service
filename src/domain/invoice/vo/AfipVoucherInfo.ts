export interface AfipVoucherInfo {
  cae?: string;
  caeExpiration?: string; // yyyy-mm-dd
  voucherNumber?: number;
  afipResponse?: any; // para auditoría
}
