import { Invoice } from "../Invoice";
import { CONCEPT } from "../vo/Concept";
import { DayDate } from "../vo/Day";
import { Identification } from "../vo/Identification";

export type IssueInvoiceUseCaseInput = {
  externalId?: string | null;
  amount: number;
  idDocument: Identification;
  concept: CONCEPT;
  serviceFrom?: DayDate;
  serviceTo?: DayDate;
  pointOfSale?: number;
  idempotencyKey?: string;
}
export type IssueInvoiceUseCaseOutput = {
  invoice: Invoice
}

export interface IssueInvoiceUseCase {
  execute(input: IssueInvoiceUseCaseInput): Promise<IssueInvoiceUseCaseOutput>
}