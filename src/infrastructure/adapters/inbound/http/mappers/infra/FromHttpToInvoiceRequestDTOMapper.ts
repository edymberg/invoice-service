import z from "zod";
import { InvoiceRequestDTO } from "../../dtos/InvoiceRequestDTO";

export class FromHttpToInvoiceRequestDTOMapper {
	public map(json: any): InvoiceRequestDTO {
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