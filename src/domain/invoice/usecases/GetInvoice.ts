import { UseCase, UseCaseInput, UseCaseOutput } from "../../../../framework/mediator";
import { Invoice } from "../Invoice";

export type GetInvoiceUseCaseInput = {
  id: string;
} & UseCaseInput;

export type GetInvoiceUseCaseOutput = {
  invoice: Invoice | null;
} & UseCaseOutput;

export interface GetInvoiceUseCase extends UseCase<
  GetInvoiceUseCaseInput,
  GetInvoiceUseCaseOutput
> {
  execute(input: GetInvoiceUseCaseInput): Promise<GetInvoiceUseCaseOutput>;
}
