import Afip from "@afipsdk/afip.js";
import { env } from "../../../config/env";
import { ElectronicBillingPort, CreateVoucherRequest, CreateNextVoucherResult } from "../../../../business/ports/ElectronicBillingPort";
import { Mapper } from "../../../../../framework/Mapper";
import { AFIPCreateNextVoucherRequest, AFIPCreateNextVoucherResponse } from "./dtos/Afip";

export class AfipSdkElectronicBillingAdapter implements ElectronicBillingPort {
  private afip: any;

  constructor(
    private inboundMapper: Mapper<CreateVoucherRequest, AFIPCreateNextVoucherRequest>,
    private outboundMapper: Mapper<AFIPCreateNextVoucherResponse, CreateNextVoucherResult>
  ) {
    const baseConfig: any = { CUIT: env.arca.cuit };
    if (env.arca.environment === "dev") {
      baseConfig.access_token = env.arca.accessToken; // modo dev
    } else {
      baseConfig.cert = env.arca.cert;
      baseConfig.key = env.arca.key;
    }
    this.afip = new (Afip as any)(baseConfig);
  }

  async createNextVoucher(data: CreateVoucherRequest): Promise<CreateNextVoucherResult> {
    return this.outboundMapper.map(
      await this.afip.ElectronicBilling.createNextVoucher(
        this.inboundMapper.map(data)
      )
    );
  }

  async getServerStatus(): Promise<any> {
    if (this.afip?.ElectronicBilling?.getServerStatus) {
      return this.afip.ElectronicBilling.getServerStatus();
    }
    return { appserver: "unknown", dbserver: "unknown", authserver: "unknown" };
  }
}
