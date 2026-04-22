import z from "zod";

import { DTOMappingException, RestDTOError } from "../../../../../../../framework/http";
import { PinoLoggerFactory } from "../../../../../../../framework/logging";
import { Mapper } from "../../../../../../../framework/mediator";
import { CreateInvoiceRequestDTO } from "../../dtos/CreateInvoiceRequestDTO";

export class FromHttpToInvoiceRequestDTOMapper implements Mapper<unknown, CreateInvoiceRequestDTO> {
  private readonly logger = PinoLoggerFactory.getLogger("FromHttpToInvoiceRequestDTOMapper");

  public map(json: unknown): CreateInvoiceRequestDTO {
    const schema = z.object({
      externalId: z.string().min(1).optional().nullable(),
      monto: z.number().positive(),
      dni: z.number().int().min(1000000).max(99999999).optional().nullable(),
      cuit: z.number().int().min(10000000000).max(99999999999).optional().nullable(),
      concept: z.union([z.literal(1), z.literal(2)]),
      serviceFrom: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
      serviceTo: z
        .string()
        .regex(/^\d{4}-\d{2}-\d{2}$/)
        .optional(),
      pointOfSale: z.number().int().positive(),
    });

    // TODO: handle ZodError and return DTOValidationException
    try {
      return schema.parse(json) as CreateInvoiceRequestDTO;
    } catch (error: any) {
      const restDTOError: RestDTOError = error.issues.map((e: any) => ({
        path: e.path[0],
        code: e.code,
        message: e.message,
      }));
      this.logger.error({ error }, "Error mapping request body");
      throw new DTOMappingException("Invalid request body", restDTOError);
    }
  }
}
