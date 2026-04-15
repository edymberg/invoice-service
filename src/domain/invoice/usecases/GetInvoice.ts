import { Invoice } from "../Invoice";

export type GetInvoiceUseCaseInput = {
  id: string;
};
export type GetInvoiceUseCaseOutput = {
  invoice: Invoice | null;
};

export interface GetInvoiceUseCase {
  execute(input: GetInvoiceUseCaseInput): Promise<GetInvoiceUseCaseOutput>;
}
