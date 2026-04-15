import z from "zod";

import { Mapper } from "../../../../../../../framework/Mapper";
import { CreateInvoiceRequestDTO } from "../../dtos/CreateInvoiceRequestDTO";

export class FromHttpToInvoiceRequestDTOMapper implements Mapper<unknown, CreateInvoiceRequestDTO> {
  public map(json: unknown): CreateInvoiceRequestDTO {
    const schema = z.object({
      externalId: z.string().min(1).nullable(),
      monto: z.number().positive(),
      dni: z.number().int().min(1000000).max(99999999).nullable(),
      cuit: z.number().int().min(1000000).max(99999999).nullable(),
      concept: z.union([z.literal(1), z.literal(2)]),
      serviceFrom: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      serviceTo: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
      pointOfSale: z.number().int().positive(),
    });

    return schema.parse(json);
  }
}
