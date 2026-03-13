import { Invoice } from "../../../src/domain/invoice/Invoice";
import { Money } from "../../../src/domain/invoice/vo/Money";
import { PointOfSale } from "../../../src/domain/invoice/vo/PointOfSale";
import { Concept, CONCEPT } from "../../../src/domain/invoice/vo/Concept";
import { Day } from "../../../src/domain/invoice/vo/Day";
import { Identification, DocumentType } from "../../../src/domain/invoice/vo/Identification";
import { VoucherType } from "../../../src/domain/invoice/vo/VoucherType";
import { InvoiceStatus } from "../../../src/domain/invoice/vo/InvoiceStatus";
import { AfipVoucherInfo } from "../../../src/domain/invoice/vo/AfipVoucherInfo";

describe('Invoice', () => {
  const anInvoiceId = (): string => "invoice-123";
  const anExternalId = (): string => "external-123";
  const aPointOfSale = (): PointOfSale => PointOfSale.from(1);
  const aVoucherType = (): VoucherType => VoucherType.A;
  const aProductConcept = (): Concept => Concept.from(CONCEPT.PRODUCTS);
  const aServiceConcept = (): Concept => Concept.from(CONCEPT.SERVICES);
  const anIdentification = (): Identification => Identification.builder().value(12345678).type(DocumentType.DNI).build();
  const aDay = (): Day => Day.initialize(15, 6, 2023);
  const anAmount = (): Money => Money.fromTotal(1000);
  const aServiceFromDay = (): Day => Day.initialize(15, 6, 2023);
  const aServiceToDay = (): Day => Day.initialize(15, 6, 2023);
  const anAfipInfo = (): AfipVoucherInfo => ({
    cae: "12345678901234",
    caeExpiration: "20231231",
    voucherNumber: 1,
    afipResponse: { result: "A" }
  });
  const anInvoice = (status?: InvoiceStatus, concept?: Concept) => Invoice.builder()
    .id(anInvoiceId())
    .externalId(anExternalId())
    .status(status || InvoiceStatus.Draft)
    .pointOfSale(aPointOfSale())
    .voucherType(aVoucherType())
    .concept(concept || aProductConcept())
    .serviceFrom(concept?.isService() ? aServiceFromDay() : undefined)
    .serviceTo(concept?.isService() ? aServiceToDay() : undefined)
    .idDocument(anIdentification())
    .date(aDay())
    .total(anAmount())
    .build();

  let invoice: Invoice;


  describe('#builder', () => {
    it('Given builder with all fields set, when building invoice, then should create invoice successfully', () => {
      const invoice = Invoice.builder()
        .id(anInvoiceId())
        .externalId(anExternalId())
        .status(InvoiceStatus.Draft)
        .pointOfSale(aPointOfSale())
        .voucherType(aVoucherType())
        .concept(aProductConcept())
        .idDocument(anIdentification())
        .date(aDay())
        .total(anAmount())
        .build();

      expect(invoice.id).toBe(anInvoiceId());
      expect(invoice.externalId).toBe(anExternalId());
      expect(invoice.status).toBe(InvoiceStatus.Draft);
      expect(invoice.pointOfSale).toStrictEqual(aPointOfSale());
      expect(invoice.voucherType).toBe(aVoucherType());
      expect(invoice.concept).toStrictEqual(aProductConcept());
      expect(invoice.idDocument).toStrictEqual(anIdentification());
      expect(invoice.date).toStrictEqual(aDay());
      expect(invoice.amount).toStrictEqual(anAmount());
    });

    it('Given builder with service concept and service dates, when building invoice, then should create invoice successfully', () => {
      const invoice = Invoice.builder()
        .id(anInvoiceId())
        .externalId(anExternalId())
        .status(InvoiceStatus.Draft)
        .pointOfSale(aPointOfSale())
        .voucherType(aVoucherType())
        .concept(aServiceConcept())
        .idDocument(anIdentification())
        .date(aDay())
        .total(anAmount())
        .serviceFrom(aServiceFromDay())
        .serviceTo(aServiceToDay())
        .build();

      expect(invoice.concept).toStrictEqual(aServiceConcept());
      expect(invoice.serviceFrom).toStrictEqual(aServiceFromDay());
      expect(invoice.serviceTo).toStrictEqual(aServiceToDay());
    });

    it('Given builder with AFIP info, when building invoice, then should include AFIP info', () => {
      const afipInfo = anAfipInfo();
      
      const invoice = Invoice.builder()
        .id(anInvoiceId())
        .externalId(anExternalId())
        .status(InvoiceStatus.Issued)
        .pointOfSale(aPointOfSale())
        .voucherType(aVoucherType())
        .concept(aProductConcept())
        .idDocument(anIdentification())
        .date(aDay())
        .total(anAmount())
        .afip(afipInfo)
        .build();

      expect(invoice.afip).toStrictEqual(afipInfo);
    });

    it('Given service concept without service dates, when initializing invoice, then should throw business rule violation', () => {
      const act = () => Invoice.builder()
        .id(anInvoiceId())
        .externalId(anExternalId())
        .status(InvoiceStatus.Draft)
        .pointOfSale(aPointOfSale())
        .voucherType(aVoucherType())
        .concept(aServiceConcept())
        .idDocument(anIdentification())
        .date(aDay())
        .total(anAmount())
        .build();

      expect(act).toThrow("ServiceFrom is required for Concept.SERVICES");
    });

    it('Given service concept with serviceFrom but without serviceTo, when initializing invoice, then should throw business rule violation', () => {
      const act = () => Invoice.builder()
        .id(anInvoiceId())
        .externalId(anExternalId())
        .status(InvoiceStatus.Draft)
        .pointOfSale(aPointOfSale())
        .voucherType(aVoucherType())
        .concept(aServiceConcept())
        .idDocument(anIdentification())
        .date(aDay())
        .total(anAmount())
        .serviceFrom(aServiceFromDay())
        .build();

      expect(act).toThrow("ServiceTo is required for Concept.SERVICES");
    });

    it('Given null external ID, when initializing invoice, then should accept null external ID', () => {
      const invoice = Invoice.builder()
        .id(anInvoiceId())
        .status(InvoiceStatus.Draft)
        .pointOfSale(aPointOfSale())
        .voucherType(aVoucherType())
        .concept(aProductConcept())
        .idDocument(anIdentification())
        .date(aDay())
        .total(anAmount())
        .build(); // externalId was not passed

      expect(invoice.externalId).toBeUndefined();
    });
  });

  describe('#markIssuing', () => {
    it('Given draft invoice, when marking as issuing, then should return new invoice with issuing status', () => {
      const invoice = anInvoice(InvoiceStatus.Draft, aProductConcept());
      const issuingInvoice = invoice.markIssuing();

      expect(issuingInvoice.id).toBe(invoice.id);
      expect(issuingInvoice.status).toBe(InvoiceStatus.Issuing);
      expect(issuingInvoice).not.toBe(invoice); // New instance
    });

    it('Given service invoice, when marking as issuing, then should preserve service dates', () => {
      const invoice = anInvoice(InvoiceStatus.Draft, aServiceConcept());
      const issuingInvoice = invoice.markIssuing();

      expect(issuingInvoice.status).toBe(InvoiceStatus.Issuing);
      expect(issuingInvoice.serviceFrom).toBe(invoice.serviceFrom);
      expect(issuingInvoice.serviceTo).toBe(invoice.serviceTo);
    });
  });

  describe('#markIssued', () => {
    it('Given issuing invoice, when marking as issued, then should return new invoice with issued status and AFIP info', () => {    
      const invoice = anInvoice(InvoiceStatus.Issuing, aProductConcept());
      const cae = "12345678901234";
      const caeExpiration = "20231231";
      const voucherNumber = 1;
      const afipResponse = { result: "A" };

      const issuedInvoice = invoice.markIssued({cae, caeExpiration, voucherNumber, afipResponse});

      expect(issuedInvoice.id).toBe(invoice.id);
      expect(issuedInvoice.status).toBe(InvoiceStatus.Issued);
      expect(issuedInvoice.afip).toStrictEqual({
        cae,
        caeExpiration,
        voucherNumber,
        afipResponse
      });
      expect(issuedInvoice).not.toBe(invoice); // New instance
    });

    it('Given service invoice, when marking as issued, then should preserve service dates', () => {
      const invoice = anInvoice(InvoiceStatus.Issuing, aServiceConcept());

      const issuedInvoice = invoice.markIssued({cae: "12345678901234", caeExpiration: "20231231", voucherNumber: 1, afipResponse: {result: "A"}});

      expect(issuedInvoice.status).toBe(InvoiceStatus.Issued);
      expect(issuedInvoice.serviceFrom).toBe(invoice.serviceFrom);
      expect(issuedInvoice.serviceTo).toBe(invoice.serviceTo);
    });
  });

  describe('#markFailed', () => {
    it('Given issuing invoice, when marking as failed, then should return new invoice with failed status', () => {
      const invoice = anInvoice(InvoiceStatus.Issuing, aProductConcept());
      const reason = "AFIP service unavailable";

      const failedInvoice = invoice.markFailed(reason);

      expect(failedInvoice.id).toBe(invoice.id);
      expect(failedInvoice.status).toBe(InvoiceStatus.Failed);
      expect(failedInvoice).not.toBe(invoice); // New instance
    });
  });

  describe('#accessors', () => {
    it('Given invoice, when accessing docType, then should return document type', () => {
      const invoice = anInvoice();

      expect(invoice.docType()).toBe(DocumentType.DNI);
    });

    it('Given invoice, when accessing docNumber, then should return document number', () => {
      const invoice = anInvoice();

      expect(invoice.docNumber()).toBe(12345678);
    });

    it('Given invoice, when accessing currency, then should return currency', () => {
      const invoice = anInvoice();

      expect(invoice.currency()).toBe("ARS");
    });

    it('Given product invoice, when checking concept type, then should return correct concept type', () => {
      const invoice = anInvoice(undefined, aProductConcept());

      expect(invoice.isProductConcept()).toBe(true);
      expect(invoice.isServiceConcept()).toBe(false);
      expect(invoice.conceptValue()).toBe(CONCEPT.PRODUCTS);
    });

    it('Given service invoice, when checking concept type, then should return correct concept type', () => {
      const invoice = anInvoice(undefined, aServiceConcept());

      expect(invoice.isProductConcept()).toBe(false);
      expect(invoice.isServiceConcept()).toBe(true);
      expect(invoice.conceptValue()).toBe(CONCEPT.SERVICES);
    });

    it('Given invoice, when accessing totalAmount, then should return amount value', () => {
      const invoice = anInvoice();

      expect(invoice.totalAmount()).toBe(anAmount().amount);
    });

    it('Given invoice, when accessing pointOfSaleValue, then should return point of sale value', () => {
      const invoice = anInvoice();

      expect(invoice.pointOfSaleValue()).toBe(1);
    });

    it('Given invoice, when accessing dateValue, then should return date value', () => {
      const invoice = anInvoice();

      expect(invoice.dateValue()).toBe(20230615);
    });
  });
});
