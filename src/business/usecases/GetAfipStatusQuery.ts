import { ElectronicBillingPort } from "../ports/ElectronicBillingPort";

export class GetAfipStatusQuery {
  constructor(private readonly ebill: ElectronicBillingPort) {}

  async execute(): Promise<any> {
    return this.ebill.getServerStatus();
  }
}
