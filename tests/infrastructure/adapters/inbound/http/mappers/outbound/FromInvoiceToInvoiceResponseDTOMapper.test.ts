import { FromInvoiceToInvoiceResponseDTOMapper } from "../../../../../../../src/infrastructure/adapters/inbound/http/mappers/outbound/FromInvoiceToInvoiceResponseDTOMapper";
import { Invoice } from "../../../../../../../src/domain/invoice/Invoice";
import { InvoiceStatus } from "../../../../../../../src/domain/invoice/vo/InvoiceStatus";

describe('FromInvoiceToInvoiceResponseDTOMapper', () => {
  const anInvoiceId = (): string => "invoice-123";
  const aCae = (): string => "12345678901234";
  const aCaeExpiration = (): string => "20231231";
  const aVoucherNumber = (): number => 1;

  const aDraftInvoice = (): Invoice => {
    return {
      id: anInvoiceId(),
      status: InvoiceStatus.Draft,
      afip: undefined
    } as any;
  };

  const anIssuedInvoice = (): Invoice => {
    return {
      id: anInvoiceId(),
      status: InvoiceStatus.Issued,
      afip: {
        cae: aCae(),
        caeExpiration: aCaeExpiration(),
        voucherNumber: aVoucherNumber()
      }
    } as any;
  };

  const aFailedInvoice = (): Invoice => {
    return {
      id: anInvoiceId(),
      status: InvoiceStatus.Failed,
      afip: undefined
    } as any;
  };

  let mapper: FromInvoiceToInvoiceResponseDTOMapper;

  beforeEach(() => {
    mapper = new FromInvoiceToInvoiceResponseDTOMapper();
  });

  it('Given draft invoice, when mapping, then should return response with null AFIP data', () => {
    const invoice = aDraftInvoice();

    const result = mapper.map(invoice);

    expect(result).toStrictEqual({
      id: anInvoiceId(),
      status: "Draft",
      cae: null,
      caeVto: null,
      voucherNumber: null
    });
  });

  it('Given issued invoice, when mapping, then should return response with AFIP data', () => {
    const invoice = anIssuedInvoice();

    const result = mapper.map(invoice);

    expect(result).toStrictEqual({
      id: anInvoiceId(),
      status: "Issued",
      cae: aCae(),
      caeVto: aCaeExpiration(),
      voucherNumber: aVoucherNumber()
    });
  });

  it('Given failed invoice, when mapping, then should return response with null AFIP data', () => {
    const invoice = aFailedInvoice();

    const result = mapper.map(invoice);

    expect(result).toStrictEqual({
      id: anInvoiceId(),
      status: "Failed",
      cae: null,
      caeVto: null,
      voucherNumber: null
    });
  });

  it('Given invoice with partial AFIP data, when mapping, then should handle missing fields correctly', () => {
    const invoice = {
      id: anInvoiceId(),
      status: InvoiceStatus.Issuing,
      afip: {
        cae: aCae(),
        caeExpiration: undefined,
        voucherNumber: undefined
      }
    } as any;

    const result = mapper.map(invoice);

    expect(result).toStrictEqual({
      id: anInvoiceId(),
      status: "Issuing",
      cae: aCae(),
      caeVto: null,
      voucherNumber: null
    });
  });
});
