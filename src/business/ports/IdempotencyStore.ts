export interface IdempotencyStore {
  get(key: string): Promise<{ invoiceId: string } | null>;
  put(key: string, invoiceId: string): Promise<void>;
}
