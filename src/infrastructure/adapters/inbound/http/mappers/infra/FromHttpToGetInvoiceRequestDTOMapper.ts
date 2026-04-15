import z from "zod";

import { Mapper } from "../../../../../../../framework/Mapper";
import { GetInvoiceRequestDTO } from "../../dtos/GetInvoiceRequestDTO";

export class FromHttpToGetInvoiceRequestDTOMapper implements Mapper<unknown, GetInvoiceRequestDTO> {
  public map(json: unknown): GetInvoiceRequestDTO {
    const schema = z.object({
      id: z.string().min(1),
    });

    return schema.parse(json);
  }
}
