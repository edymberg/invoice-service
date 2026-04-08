import { Db } from "mongodb";

import { IdempotencyStore } from "../../../../../business/ports/IdempotencyStore";

export class IdempotencyStoreMongoAdapter implements IdempotencyStore {
  private collection = "idempotency";
  private db: Db;

  constructor(db: Db) {
    this.db = db;
  }

  async get(key: string): Promise<{ invoiceId: string } | null> {
    const found = await this.db.collection(this.collection).findOne({ key });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (found as any) ?? null;
  }

  async put(key: string, invoiceId: string): Promise<void> {
    await this.db
      .collection(this.collection)
      .updateOne({ key }, { $set: { key, invoiceId } }, { upsert: true });
  }
}
