import { InvoiceStatus } from "../../../../../src/domain/invoice/vo/InvoiceStatus";

describe('InvoiceStatus', () => {
  test.each([
    [InvoiceStatus.Draft, "Draft"],
    [InvoiceStatus.Issuing, "Issuing"],
    [InvoiceStatus.Issued, "Issued"],
    [InvoiceStatus.Failed, "Failed"],
  ])('Given invoice status %s, when checking value, then should return %s', (status, expectedValue) => {
    expect(status).toBe(expectedValue);
  });
});
