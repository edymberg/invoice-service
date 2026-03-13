import { InvoiceRepositoryMongoAdapter } from "../../../../../../src/infrastructure/adapters/inbound/persistance/mongo/InvoiceRepositoryMongoAdapter";
import { Invoice } from "../../../../../../src/domain/invoice/Invoice";
import { InvoiceStatus } from "../../../../../../src/domain/invoice/vo/InvoiceStatus";

describe('InvoiceRepositoryMongoAdapter', () => {
  const anInvoiceId = (): string => "invoice-123";
  const anExternalId = (): string => "external-123";
  const collectionName = "invoices";

  const aMockInvoice = (): Invoice => {
    return {
      id: anInvoiceId(),
      externalId: anExternalId(),
      status: InvoiceStatus.Draft,
      amount: { amount: 1000, currency: "ARS" }
    } as any;
  };

  const mockCollection = {
    updateOne: jest.fn(),
    findOne: jest.fn(),
    insertOne: jest.fn()
  };

  const mockDb = {
    collection: jest.fn(() => mockCollection)
  };

  let repository: InvoiceRepositoryMongoAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    mockCollection.updateOne.mockReset();
    mockCollection.findOne.mockReset();
    mockCollection.insertOne.mockReset();
    repository = new InvoiceRepositoryMongoAdapter(mockDb as any);
  });

  describe('#save', () => {
    it('Given invoice, when saving, then should upsert to database', async () => {
      const invoice = aMockInvoice();

      await repository.save(invoice);

      expect(mockDb.collection).toHaveBeenCalledWith(collectionName);
      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { id: anInvoiceId() },
        { $set: invoice },
        { upsert: true }
      );
    });

    it('Given database connection error, when saving, then should propagate error', async () => {
      const invoice = aMockInvoice();
      const error = new Error("Database connection failed");

      mockCollection.updateOne.mockRejectedValue(error);

      const act = async () => await repository.save(invoice);

      await expect(act).rejects.toThrow("Database connection failed");
    });
  });

  describe('#update', () => {
    it('Given invoice, when updating, then should call save method', async () => {
      const invoice = aMockInvoice();

      await repository.update(invoice);

      expect(mockCollection.updateOne).toHaveBeenCalledWith(
        { id: anInvoiceId() },
        { $set: invoice },
        { upsert: true }
      );
    });
  });

  describe('#findById', () => {
    it('Given existing invoice ID, when finding by ID, then should return invoice', async () => {
      const invoice = aMockInvoice();
      const invoiceId = anInvoiceId();

      mockCollection.findOne.mockResolvedValue(invoice);

      const result = await repository.findById(invoiceId);

      expect(mockDb.collection).toHaveBeenCalledWith(collectionName);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ id: invoiceId });
      expect(result).toBe(invoice);
    });

    it('Given non-existing invoice ID, when finding by ID, then should return null', async () => {
      const invoiceId = "non-existing";

      mockCollection.findOne.mockResolvedValue(null);

      const result = await repository.findById(invoiceId);

      expect(mockCollection.findOne).toHaveBeenCalledWith({ id: invoiceId });
      expect(result).toBeNull();
    });

    it('Given database query error, when finding by ID, then should propagate error', async () => {
      const invoiceId = anInvoiceId();
      const error = new Error("Query failed");

      mockCollection.findOne.mockRejectedValue(error);

      const act = async () => await repository.findById(invoiceId);

      await expect(act).rejects.toThrow("Query failed");
    });
  });

  describe('#findByExternalId', () => {
    it('Given existing external ID, when finding by external ID, then should return invoice', async () => {
      const invoice = aMockInvoice();
      const externalId = anExternalId();

      mockCollection.findOne.mockResolvedValue(invoice);

      const result = await repository.findByExternalId(externalId);

      expect(mockDb.collection).toHaveBeenCalledWith(collectionName);
      expect(mockCollection.findOne).toHaveBeenCalledWith({ externalId });
      expect(result).toBe(invoice);
    });

    it('Given non-existing external ID, when finding by external ID, then should return null', async () => {
      const externalId = "non-existing-external";

      mockCollection.findOne.mockResolvedValue(null);

      const result = await repository.findByExternalId(externalId);

      expect(mockCollection.findOne).toHaveBeenCalledWith({ externalId });
      expect(result).toBeNull();
    });
  });
});
