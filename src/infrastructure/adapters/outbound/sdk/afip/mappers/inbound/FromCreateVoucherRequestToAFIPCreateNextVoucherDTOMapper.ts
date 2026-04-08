import { Mapper } from "../../../../../../../../framework/Mapper";
import { CreateVoucherRequest } from "../../../../../../../business/ports/ElectronicBillingPort";
import { AFIPCreateNextVoucherRequest } from "../../dtos/Afip";

export class FromCreateVoucherRequestToAFIPCreateNextVoucherDTOMapper implements Mapper<
  CreateVoucherRequest,
  AFIPCreateNextVoucherRequest
> {
  public map(data: CreateVoucherRequest): AFIPCreateNextVoucherRequest {
    // createNextVoucher no requiere CbteDesde/Hasta
    return { ...data };
  }
}
