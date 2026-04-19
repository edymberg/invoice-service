import { InboundDTO } from "../../../../../../framework/mediator";

export type CreateInvoiceEventInboundDTO = {
  id: string;
  externalId?: string | null;
  amount: number;
  idDocument?: number | null;
  cuit?: number | null;
  concept: 1 | 2;
  serviceFrom?: { day: number; month: number; year: number };
  serviceTo?: { day: number; month: number; year: number };
  pointOfSale: number;
  idempotencyKey: string;
} & InboundDTO;
