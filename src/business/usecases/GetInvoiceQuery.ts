import { InvoiceRepository } from "../../domain/invoice/repositories/InvoiceRepository";
import {
  GetInvoiceUseCase,
  GetInvoiceUseCaseInput,
  GetInvoiceUseCaseOutput,
} from "../../domain/invoice/usecases/GetInvoice";

export class GetInvoiceQuery implements GetInvoiceUseCase {
  constructor(private readonly repo: InvoiceRepository) {}

  async execute(input: GetInvoiceUseCaseInput): Promise<GetInvoiceUseCaseOutput> {
    const invoice = await this.repo.findById(input.id);
    return { invoice };
  }
}
