import { UseCase, UseCaseInput, UseCaseOutput } from "../../../../framework/mediator";
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
} & UseCaseInput;

export type IssueInvoiceUseCaseOutput = {
  invoice: Invoice;
} & UseCaseOutput;

export interface IssueInvoiceUseCase extends UseCase<
  IssueInvoiceUseCaseInput,
  IssueInvoiceUseCaseOutput
> {
  execute(input: IssueInvoiceUseCaseInput): Promise<IssueInvoiceUseCaseOutput>;
}
