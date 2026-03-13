import { Invoice } from "../Invoice";
import { CONCEPT } from "../vo/Concept";
import { Day } from "../vo/Day";
import { Identification } from "../vo/Identification";

export type IssueInvoiceUseCaseInput = {
  externalId?: string | null;
  amount: number;
  idDocument: Identification;
  concept: CONCEPT;
  serviceFrom?: Day;
  serviceTo?: Day;
  pointOfSale?: number;
  idempotencyKey?: string;
};
export type IssueInvoiceUseCaseOutput = {
  invoice: Invoice;
};

export interface IssueInvoiceUseCase {
  execute(input: IssueInvoiceUseCaseInput): Promise<IssueInvoiceUseCaseOutput>;
}
