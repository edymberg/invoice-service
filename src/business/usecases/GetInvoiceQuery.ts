import { Invoice } from "../../domain/invoice/Invoice";
import { InvoiceRepository } from "../../domain/invoice/repositories/InvoiceRepository";

export class GetInvoiceQuery {
  constructor(private readonly repo: InvoiceRepository) {}

  async execute(id: string): Promise<Invoice | null> {
    return await this.repo.findById(id);
  }
}
