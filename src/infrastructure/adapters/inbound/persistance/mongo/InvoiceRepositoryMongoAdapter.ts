import { InvoiceRepository } from "../../../../../domain/invoice/repositories/InvoiceRepository";
import { Invoice } from "../../../../../domain/invoice/Invoice";
import { Db } from "mongodb";

export class InvoiceRepositoryMongoAdapter implements InvoiceRepository {
  private collectionName = "invoices";
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  async save(invoice: Invoice): Promise<void> {
    await this.db.collection(this.collectionName).updateOne(
      { id: invoice.id },
      { $set: invoice },
      { upsert: true }
    );
  }

  async update(invoice: Invoice): Promise<void> {
    return this.save(invoice);
  }

  async findById(id: string): Promise<Invoice | null> {
    const doc = await this.db.collection(this.collectionName).findOne({ id });
    return doc as any;
  }

  async findByExternalId(externalId: string): Promise<Invoice | null> {
    const doc = await this.db.collection(this.collectionName).findOne({ externalId });
    return doc as any;
  }
}
