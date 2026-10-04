import { FromGetInvoiceQueryToGetInvoiceResponseDTOMapper } from "../../../../../../../../src/infrastructure/adapters/inbound/http/mappers/outbound/FromGetInvoiceQueryToGetInvoiceResponseDTOMapper";
import { Invoice } from "../../../../../../../../src/domain/invoice/Invoice";
import { InvoiceStatus } from "../../../../../../../../src/domain/invoice/vo/InvoiceStatus";
import { Concept, CONCEPT } from "../../../../../../../../src/domain/invoice/vo/Concept";
import { Day } from "../../../../../../../../src/domain/invoice/vo/Day";
import { Currency, Money } from "../../../../../../../../src/domain/invoice/vo/Money";
import { PointOfSale } from "../../../../../../../../src/domain/invoice/vo/PointOfSale";
import { VoucherType } from "../../../../../../../../src/domain/invoice/vo/VoucherType";
import { Identification, DocumentType } from "../../../../../../../../src/domain/invoice/vo/Identification";
import { GetInvoiceUseCaseOutput } from "../../../../../../../../src/domain/invoice/usecases/GetInvoice";

describe('FromGetInvoiceQueryToGetInvoiceResponseDTOMapper', () => {
  const anInvoiceId = (): string => "invoice-123";
  const anExternalId = (): string => "external-456";
  const aCae = (): string => "12345678901234";
  const aCaeExpiration = (): string => "20231231";
  const aVoucherNumber = (): number => 1;

  const aCompleteInvoice = (): Invoice => {
    return Invoice.builder()
      .id(anInvoiceId())
      .externalId(anExternalId())
      .status(InvoiceStatus.Issued)
      .pointOfSale(PointOfSale.from(1))
      .voucherType(VoucherType.A)
      .conceptType(CONCEPT.PRODUCTS)
      .idDocument(Identification.builder().type(DocumentType.DNI).value(12345678).build())
      .date(Day.builder().year(2023).month(6).day(15).build())
      .total(Money.builder().amount(1000).currency(Currency.ARS).build())
      .afip({
        cae: aCae(),
        caeExpiration: aCaeExpiration(),
        voucherNumber: aVoucherNumber()
      })
      .build();
  };

  const anInvoiceWithoutExternalId = (): Invoice => {
    return Invoice.builder()
      .id(anInvoiceId())
      .status(InvoiceStatus.Issued)
      .pointOfSale(PointOfSale.from(1))
      .voucherType(VoucherType.A)
      .conceptType(CONCEPT.PRODUCTS)
      .idDocument(Identification.builder().type(DocumentType.DNI).value(12345678).build())
      .date(Day.builder().year(2023).month(6).day(15).build())
      .total(Money.builder().amount(1000).currency(Currency.ARS).build())
      .afip({
        cae: aCae(),
        caeExpiration: aCaeExpiration(),
        voucherNumber: aVoucherNumber()
      })
      .build();
  };

  const aServiceInvoice = (): Invoice => {
    return Invoice.builder()
      .id(anInvoiceId())
      .externalId(anExternalId())
      .status(InvoiceStatus.Issued)
      .pointOfSale(PointOfSale.from(2))
      .voucherType(VoucherType.A)
      .conceptType(CONCEPT.SERVICES)
      .idDocument(Identification.builder().type(DocumentType.CUIT).value(20123456789).build())
      .date(Day.builder().year(2023).month(6).day(15).build())
      .total(Money.builder().amount(2000).currency(Currency.ARS).build())
      .serviceFrom(Day.builder().year(2023).month(6).day(1).build())
      .serviceTo(Day.builder().year(2023).month(6).day(15).build())
      .afip({
        cae: aCae(),
        caeExpiration: aCaeExpiration(),
        voucherNumber: aVoucherNumber()
      })
      .build();
  };

  const aDraftInvoice = (): Invoice => {
    return Invoice.builder()
      .id(anInvoiceId())
      .externalId(anExternalId())
      .status(InvoiceStatus.Draft)
      .pointOfSale(PointOfSale.from(1))
      .voucherType(VoucherType.A)
      .conceptType(CONCEPT.PRODUCTS)
      .idDocument(Identification.builder().type(DocumentType.DNI).value(12345678).build())
      .date(Day.builder().year(2023).month(6).day(15).build())
      .total(Money.builder().amount(1000).currency(Currency.ARS).build())
      .build();
  };

  const aGetInvoiceUseCaseOutput = (invoice: Invoice): any => ({ invoice });

  let mapper: FromGetInvoiceQueryToGetInvoiceResponseDTOMapper;

  beforeEach(() => {
    mapper = new FromGetInvoiceQueryToGetInvoiceResponseDTOMapper();
  });

  it('Given complete invoice, when mapping, then should return response with all fields', () => {
    const invoice = aCompleteInvoice();

    const result = mapper.map(aGetInvoiceUseCaseOutput(invoice));

    expect(result.id).toBe(anInvoiceId());
    expect(result.externalId).toBe(anExternalId());
    expect(result.status).toBe(InvoiceStatus.Issued);
    expect(result.pointOfSale).toBe(1);
    expect(result.voucherType).toBe(1);
    expect(result.concept).toBe(CONCEPT.PRODUCTS);
    expect(result.documentType).toBe(DocumentType.DNI);
    expect(result.documentNumber).toBe(12345678);
    expect(result.date).toBe("2023-06-15");
    expect(result.amount).toBe(1000);
    expect(result.currency).toBe("ARS");
    expect(result.serviceFrom).toBeNull();
    expect(result.serviceTo).toBeNull();
    expect(result.cae).toBe(aCae());
    expect(result.caeVto).toBe(aCaeExpiration());
    expect(result.voucherNumber).toBe(aVoucherNumber());
  });

  it('Given invoice without external ID, when mapping, then should return response with null externalId', () => {
    const invoice = anInvoiceWithoutExternalId();

    const result = mapper.map(aGetInvoiceUseCaseOutput(invoice));

    expect(result.id).toBe(anInvoiceId());
    expect(result.externalId).toBeNull();
  });

  it('Given service invoice, when mapping, then should return response with service dates', () => {
    const invoice = aServiceInvoice();

    const result = mapper.map(aGetInvoiceUseCaseOutput(invoice));

    expect(result.id).toBe(anInvoiceId());
    expect(result.externalId).toBe(anExternalId());
    expect(result.concept).toBe(CONCEPT.SERVICES);
    expect(result.serviceFrom).toBe("2023-06-01");
    expect(result.serviceTo).toBe("2023-06-15");
  });

  it('Given draft invoice, when mapping, then should return response with null AFIP data', () => {
    const invoice = aDraftInvoice();

    const result = mapper.map(aGetInvoiceUseCaseOutput(invoice));

    expect(result.id).toBe(anInvoiceId());
    expect(result.status).toBe(InvoiceStatus.Draft);
    expect(result.cae).toBeNull();
    expect(result.caeVto).toBeNull();
    expect(result.voucherNumber).toBeNull();
  });

  it('Given null output, when mapping, then should throw error', () => {
    const act = () => mapper.map(null as unknown as GetInvoiceUseCaseOutput);

    expect(act).toThrow("Output is required");
  });

  it('Given null invoice, when mapping, then should throw error', () => {
    const act = () => mapper.map({ invoice: null } as unknown as GetInvoiceUseCaseOutput);

    expect(act).toThrow("Invoice not found");
  });

  it('Given invoice with single digit month and day, when mapping, then should pad with zeros', () => {
    const invoice = Invoice.builder()
      .id(anInvoiceId())
      .status(InvoiceStatus.Issued)
      .pointOfSale(PointOfSale.from(1))
      .voucherType(VoucherType.A)
      .conceptType(CONCEPT.PRODUCTS)
      .idDocument(Identification.builder().type(DocumentType.DNI).value(12345678).build())
      .date(Day.builder().year(2023).month(1).day(5).build())
      .total(Money.builder().amount(1000).currency(Currency.ARS).build())
      .afip({
        cae: aCae(),
        caeExpiration: aCaeExpiration(),
        voucherNumber: aVoucherNumber()
      })
      .build();

    const result = mapper.map(aGetInvoiceUseCaseOutput(invoice));

    expect(result.date).toBe("2023-01-05");
  });

  it('Given service invoice with single digit month and day, when mapping, then should pad service dates with zeros', () => {
    const invoice = Invoice.builder()
      .id(anInvoiceId())
      .status(InvoiceStatus.Issued)
      .pointOfSale(PointOfSale.from(2))
      .voucherType(VoucherType.A)
      .conceptType(CONCEPT.SERVICES)
      .idDocument(Identification.builder().type(DocumentType.CUIT).value(20123456789).build())
      .date(Day.builder().year(2023).month(6).day(15).build())
      .total(Money.builder().amount(2000).currency(Currency.ARS).build())
      .serviceFrom(Day.builder().year(2023).month(1).day(1).build())
      .serviceTo(Day.builder().year(2023).month(12).day(9).build())
      .afip({
        cae: aCae(),
        caeExpiration: aCaeExpiration(),
        voucherNumber: aVoucherNumber()
      })
      .build();

    const result = mapper.map(aGetInvoiceUseCaseOutput(invoice));

    expect(result.serviceFrom).toBe("2023-01-01");
    expect(result.serviceTo).toBe("2023-12-09");
  });
});
