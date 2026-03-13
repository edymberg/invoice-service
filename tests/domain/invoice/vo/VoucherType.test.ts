import { VoucherType } from "../../../../src/domain/invoice/vo/VoucherType";

describe('VoucherType', () => {
  test.each([
    [VoucherType.A, 1],
    [VoucherType.B, 6],
    [VoucherType.C, 11],
  ])('Given voucher type %s, when checking value, then should return %s', (voucherType, expectedValue) => {
    expect(voucherType).toBe(expectedValue);
  });
});
