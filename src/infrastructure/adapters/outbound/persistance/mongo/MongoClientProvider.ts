import { MongoClient, Db } from "mongodb";

import { env } from "../../../../config/env";

export class MongoClientProvider {
  // Static instance to avoid having more than one of this.
  private static client: MongoClient;
  private static db: Db;

  public static async getOrInitDataBase(): Promise<Db> {
    console.log(`MongoDB connecting to ${env.mongo.uri}`);
    if (this.db) {
      return this.db;
    }

    this.client = this.client || new MongoClient(env.mongo.uri);
    this.db = await this.connect();

    return this.db;
  }

  private static async connect(): Promise<Db> {
    try {
      await this.client.connect();
      return this.client.db(env.mongo.db);
    } catch {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.client = null as any;
      throw new Error("MongoDB connection failed");
    }
  }
}
