import { MongoClient, Db } from "mongodb";

import { PinoLogger, PinoLoggerFactory } from "../../../../../../framework/logging";
import { InvoiceServiceConfig } from "../../../../config/env";

// Static instance to avoid having more than one MongoClient instance.
export class MongoClientProvider {
  private static _logger: PinoLogger | null = null;
  private static client: MongoClient;
  private static db: Db;

  private static get logger(): PinoLogger {
    if (!this._logger) {
      this._logger = PinoLoggerFactory.getLogger("MongoClientProvider");
    }
    return this._logger;
  }

  public static async getOrInitDataBase(config: InvoiceServiceConfig): Promise<Db> {
    this.logger.info(`MongoDB connecting to ${config.mongo.uri}`);
    if (this.db) {
      return this.db;
    }

    this.client = this.client || new MongoClient(config.mongo.uri);
    this.db = await this.connect(config);

    return this.db;
  }

  private static async connect(config: InvoiceServiceConfig): Promise<Db> {
    try {
      await this.client.connect();
      return this.client.db(config.mongo.db);
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      this.client = null as any;
      this.logger.error({ err: error, msg: "MongoDB connection failed" });
      throw new Error("MongoDB connection failed", { cause: error });
    }
  }
}
