import { Invoice } from "../Invoice";

export interface InvoiceRepository {
  save(invoice: Invoice): Promise<void>;
  findById(id: string): Promise<Invoice | null>;
  findByExternalId(externalId: string): Promise<Invoice | null>;
  update(invoice: Invoice): Promise<void>;
}
