import Afip from "@afipsdk/afip.js";

import { AFIPCreateNextVoucherRequest, AFIPCreateNextVoucherResponse } from "./dtos/Afip";
import { Mapper } from "../../../../../../framework/hexagonal/Mapper";
import {
  ElectronicBillingPort,
  CreateVoucherRequest,
  CreateNextVoucherResult,
} from "../../../../../business/ports/ElectronicBillingPort";
import { env } from "../../../../config/env";

export class AfipSdkElectronicBillingAdapter implements ElectronicBillingPort {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private afip: any;

  constructor(
    private inboundMapper: Mapper<CreateVoucherRequest, AFIPCreateNextVoucherRequest>,
    private outboundMapper: Mapper<AFIPCreateNextVoucherResponse, CreateNextVoucherResult>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseConfig: any = { CUIT: env.arca.cuit };
    if (env.arca.environment === "dev") {
      baseConfig.access_token = env.arca.accessToken; // modo dev
    } else {
      baseConfig.cert = env.arca.cert;
      baseConfig.key = env.arca.key;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.afip = new (Afip as any)(baseConfig);
  }

  async createNextVoucher(data: CreateVoucherRequest): Promise<CreateNextVoucherResult> {
    return this.outboundMapper.map(
      await this.afip.ElectronicBilling.createNextVoucher(this.inboundMapper.map(data)),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async getServerStatus(): Promise<any> {
    if (this.afip?.ElectronicBilling?.getServerStatus) {
      return this.afip.ElectronicBilling.getServerStatus();
    }
    return { appserver: "unknown", dbserver: "unknown", authserver: "unknown" };
  }
}
