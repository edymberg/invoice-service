import Afip from "@afipsdk/afip.js";

import { AFIPCreateNextVoucherRequest, AFIPCreateNextVoucherResponse } from "./dtos/Afip";
import { Mapper } from "../../../../../../framework/mediator/mappers/Mapper";
import {
  ElectronicBillingPort,
  CreateVoucherRequest,
  CreateNextVoucherResult,
} from "../../../../../business/ports/ElectronicBillingPort";
import { InvoiceServiceConfig } from "../../../../config/env";

export class AfipSdkElectronicBillingAdapter implements ElectronicBillingPort {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private afip: any;

  constructor(
    private config: InvoiceServiceConfig,
    private inboundMapper: Mapper<CreateVoucherRequest, AFIPCreateNextVoucherRequest>,
    private outboundMapper: Mapper<AFIPCreateNextVoucherResponse, CreateNextVoucherResult>,
  ) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const baseConfig: any = { CUIT: this.config.arca.cuit };
    // TODO: should be moved to a factory
    if (config.arca.environment === "dev") {
      baseConfig.access_token = config.arca.accessToken; // modo dev
    } else {
      baseConfig.cert = config.arca.cert;
      baseConfig.key = config.arca.key;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    this.afip = new (Afip as any)(baseConfig);
  }

  async createNextVoucher(data: CreateVoucherRequest): Promise<CreateNextVoucherResult> {
    // TODO: handle error
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
