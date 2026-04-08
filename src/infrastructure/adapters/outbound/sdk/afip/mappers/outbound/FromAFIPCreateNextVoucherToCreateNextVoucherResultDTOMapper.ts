import { Mapper } from "../../../../../../../../framework/Mapper";
import { CreateNextVoucherResult } from "../../../../../../../business/ports/ElectronicBillingPort";
import { AFIPCreateNextVoucherResponse } from "../../dtos/Afip";

export class FromAFIPCreateNextVoucherToCreateNextVoucherResultDTOMapper implements Mapper<
  AFIPCreateNextVoucherResponse,
  CreateNextVoucherResult
> {
  public map(data: AFIPCreateNextVoucherResponse): CreateNextVoucherResult {
    return {
      CAE: data["CAE"],
      CAEFchVto: data["CAEFchVto"],
      voucherNumber: data["voucherNumber"],
      rawResponse: data,
    };
  }
}
