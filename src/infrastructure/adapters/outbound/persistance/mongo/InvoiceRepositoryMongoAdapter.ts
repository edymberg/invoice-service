import { Db } from "mongodb";

import { Invoice } from "../../../../../domain/invoice/Invoice";
import { InvoiceRepository } from "../../../../../domain/invoice/repositories/InvoiceRepository";

export class InvoiceRepositoryMongoAdapter implements InvoiceRepository {
  private collectionName = "invoices";
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  async save(invoice: Invoice): Promise<void> {
    await this.db
      .collection(this.collectionName)
      .updateOne({ id: invoice.id }, { $set: invoice }, { upsert: true });
  }

  async update(invoice: Invoice): Promise<void> {
    return this.save(invoice);
  }

  async findById(id: string): Promise<Invoice | null> {
    const doc = await this.db.collection(this.collectionName).findOne({ id });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return doc as any;
  }

  async findByExternalId(externalId: string): Promise<Invoice | null> {
    const doc = await this.db.collection(this.collectionName).findOne({ externalId });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return doc as any;
  }
}
