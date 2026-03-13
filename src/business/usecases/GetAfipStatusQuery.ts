import { ElectronicBillingPort } from "../ports/ElectronicBillingPort";

export class GetAfipStatusQuery {
  constructor(private readonly ebill: ElectronicBillingPort) {}

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  async execute(): Promise<any> {
    return this.ebill.getServerStatus();
  }
}
