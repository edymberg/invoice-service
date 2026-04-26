import { CONCEPT } from "../../domain/invoice/vo/Concept";

export type CreateVoucherRequest = {
  CantReg: number;
  PtoVta: number;
  CbteTipo: number; // 11 = Factura C
  Concepto: CONCEPT;
  DocTipo: number; // 96 DNI, 99 CF
  DocNro: number;
  CbteFch: number; // yyyymmdd
  MonId: string; // 'PES'
  MonCotiz: number; // 1
  ImpTotal: number;
  ImpNeto: number;
  ImpOpEx: number;
  ImpIVA: number;
  ImpTotConc: number;
  ImpTrib: number;
  FchServDesde?: number;
  FchServHasta?: number;
};
export type CreateNextVoucherResult = {
  CAE: string;
  CAEFchVto: string; // yyyy-mm-dd
  voucherNumber: number;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rawResponse?: any;
};
export interface ElectronicBillingPort {
  createNextVoucher(data: CreateVoucherRequest): Promise<CreateNextVoucherResult>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getServerStatus(): Promise<any>; // TODO: extract type
}
