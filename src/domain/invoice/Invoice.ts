import { AfipVoucherInfo } from "./vo/AfipVoucherInfo";
import { CONCEPT, Concept } from "./vo/Concept";
import { Day } from "./vo/Day";
import { Identification, DocumentType } from "./vo/Identification";
import { InvoiceStatus } from "./vo/InvoiceStatus";
import { Money } from "./vo/Money";
import { PointOfSale } from "./vo/PointOfSale";
import { VoucherType } from "./vo/VoucherType";
import { BusinessRuleViolation } from "../../../framework/BusinessRuleViolation";

export class InvoiceBusinessRuleViolation extends BusinessRuleViolation {
  constructor(message: string) {
    super(message);
  }
}

interface InvoiceBusinessRule {
  validate(invoice: Invoice): void;
}

class ConceptServicesBusinessRules implements InvoiceBusinessRule {
  validate(invoice: Invoice): void {
    if (invoice.isServiceConcept() && !invoice.serviceFrom) {
      throw new InvoiceBusinessRuleViolation("ServiceFrom is required for Concept.SERVICES");
    }
    if (invoice.isServiceConcept() && !invoice.serviceTo) {
      throw new InvoiceBusinessRuleViolation("ServiceTo is required for Concept.SERVICES");
    }
  }
}

interface InvoiceFactoryI {
  build(): Invoice;

  id(id: string): InvoiceFactoryI;
  externalId(externalId: string): InvoiceFactoryI;
  status(status: InvoiceStatus): InvoiceFactoryI;
  pointOfSale(pointOfSale: PointOfSale): InvoiceFactoryI;
  voucherType(voucherType: VoucherType): InvoiceFactoryI;
  concept(concept: Concept): InvoiceFactoryI;
  idDocument(id: Identification): InvoiceFactoryI;
  date(date: Day): InvoiceFactoryI;
  total(total: Money): InvoiceFactoryI;
  serviceFrom(serviceFrom?: Day): InvoiceFactoryI;
  serviceTo(serviceTo?: Day): InvoiceFactoryI;
  afip(afip: AfipVoucherInfo): InvoiceFactoryI;
}

export class Invoice {
  // TODO: ¿las business rules deberian ser pasadas por constructor?
  private businessRules: InvoiceBusinessRule[] = [new ConceptServicesBusinessRules()];

  private constructor(
    public readonly id: string,
    public readonly status: InvoiceStatus,
    public readonly pointOfSale: PointOfSale,
    public readonly voucherType: VoucherType,
    public readonly concept: Concept,
    public readonly idDocument: Identification,
    public readonly date: Day,
    public readonly amount: Money,
    public readonly serviceFrom?: Day,
    public readonly serviceTo?: Day,
    public readonly afip?: AfipVoucherInfo,
    public readonly externalId?: string,
  ) {}

  private static _initialize(
    id: string,
    status: InvoiceStatus,
    pointOfSale: PointOfSale,
    voucherType: VoucherType,
    concept: Concept,
    idDocument: Identification,
    date: Day,
    amount: Money,
    serviceFrom?: Day,
    serviceTo?: Day,
    afip?: AfipVoucherInfo,
    externalId?: string,
  ) {
    const invoice = new Invoice(
      id,
      status,
      pointOfSale,
      voucherType,
      concept,
      idDocument,
      date,
      amount,
      serviceFrom,
      serviceTo,
      afip,
      externalId,
    );
    invoice.businessRules.forEach((rule) => rule.validate(invoice));
    return invoice;
  }

  public static builder(): InvoiceFactoryI {
    return new Invoice.Factory();
  }

  public markIssuing() {
    return Invoice._initialize(
      this.id,
      InvoiceStatus.Issuing,
      this.pointOfSale,
      this.voucherType,
      this.concept,
      this.idDocument,
      this.date,
      this.amount,
      this.serviceFrom,
      this.serviceTo,
      this.afip,
      this.externalId,
    );
  }

  public markIssued(afipResponse: AfipVoucherInfo) {
    return Invoice._initialize(
      this.id,
      InvoiceStatus.Issued,
      this.pointOfSale,
      this.voucherType,
      this.concept,
      this.idDocument,
      this.date,
      this.amount,
      this.serviceFrom,
      this.serviceTo,
      afipResponse,
      this.externalId,
    );
  }

  public markFailed() {
    return Invoice._initialize(
      this.id,
      InvoiceStatus.Failed,
      this.pointOfSale,
      this.voucherType,
      this.concept,
      this.idDocument,
      this.date,
      this.amount,
      this.serviceFrom,
      this.serviceTo,
      this.afip,
      this.externalId,
    );
  }

  public docType(): DocumentType {
    return this.idDocument.type;
  }
  public docNumber(): number {
    return this.idDocument.value;
  }
  public currency(): string {
    return this.amount.currency;
  }
  public isProductConcept(): boolean {
    return this.concept.isProduct();
  }
  public isServiceConcept(): boolean {
    return this.concept.isService();
  }
  public totalAmount(): number {
    return this.amount.amount;
  }
  public pointOfSaleValue(): number {
    return this.pointOfSale.value;
  }
  public conceptValue(): CONCEPT {
    return this.concept.value;
  }
  public dateValue(): number {
    return this.date.numericDate;
  }

  private static Factory = class InvoiceFactory implements InvoiceFactoryI {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private invoiceFieldsMap: Record<string, any>;

    constructor() {
      this.invoiceFieldsMap = {};
    }

    build(): Invoice {
      return Invoice._initialize(
        this.invoiceFieldsMap.id,
        this.invoiceFieldsMap.status,
        this.invoiceFieldsMap.pointOfSale,
        this.invoiceFieldsMap.voucherType,
        this.invoiceFieldsMap.concept,
        this.invoiceFieldsMap.idDocument,
        this.invoiceFieldsMap.date,
        this.invoiceFieldsMap.total,
        this.invoiceFieldsMap.serviceFrom,
        this.invoiceFieldsMap.serviceTo,
        this.invoiceFieldsMap.afip,
        this.invoiceFieldsMap.externalId,
      );
    }

    id(id: string): InvoiceFactoryI {
      this.invoiceFieldsMap.id = id;
      return this;
    }

    externalId(externalId: string): InvoiceFactoryI {
      this.invoiceFieldsMap.externalId = externalId;
      return this;
    }

    status(status: InvoiceStatus): InvoiceFactoryI {
      this.invoiceFieldsMap.status = status;
      return this;
    }

    pointOfSale(pointOfSale: PointOfSale): InvoiceFactoryI {
      this.invoiceFieldsMap.pointOfSale = pointOfSale;
      return this;
    }

    voucherType(voucherType: VoucherType): InvoiceFactoryI {
      this.invoiceFieldsMap.voucherType = voucherType;
      return this;
    }

    concept(concept: Concept): InvoiceFactoryI {
      this.invoiceFieldsMap.concept = concept;
      return this;
    }

    idDocument(id: Identification): InvoiceFactoryI {
      this.invoiceFieldsMap.idDocument = id;
      return this;
    }

    date(date: Day): InvoiceFactoryI {
      this.invoiceFieldsMap.date = date;
      return this;
    }

    total(total: Money): InvoiceFactoryI {
      this.invoiceFieldsMap.total = total;
      return this;
    }

    serviceFrom(serviceFrom: Day): InvoiceFactoryI {
      this.invoiceFieldsMap.serviceFrom = serviceFrom;
      return this;
    }

    serviceTo(serviceTo: Day): InvoiceFactoryI {
      this.invoiceFieldsMap.serviceTo = serviceTo;
      return this;
    }

    afip(afip: AfipVoucherInfo): InvoiceFactoryI {
      this.invoiceFieldsMap.afip = afip;
      return this;
    }
  };
}
