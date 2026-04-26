import {
  ElectronicBillingPort,
  CreateVoucherRequest,
  CreateNextVoucherResult,
} from "../../../../../business/ports/ElectronicBillingPort";

export class AfipSdkElectronicBillingMockAdapter implements ElectronicBillingPort {

  async createNextVoucher(data: CreateVoucherRequest): Promise<CreateNextVoucherResult> {
    // TODO: handle error
    return Promise.resolve({
      CAE: "12345678901234567890", // TODO: que es el cae? Se puede sacar del CreateVoucherRequest?
      CAEFchVto: "2026-04-26", // TODO: que es el CAEFchVto? Se puede sacar del CreateVoucherRequest?
      voucherNumber: 1,
      rawResponse: {},
    });
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getServerStatus(): Promise<any> {
    return { appserver: "unknown", dbserver: "unknown", authserver: "unknown" };
  }
}
