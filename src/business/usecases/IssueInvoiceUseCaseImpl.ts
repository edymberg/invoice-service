import { v4 as uuid } from "uuid";

import { Invoice } from "../../domain/invoice/Invoice";
import { InvoiceRepository } from "../../domain/invoice/repositories/InvoiceRepository";
import {
  IssueInvoiceUseCase,
  IssueInvoiceUseCaseInput,
  IssueInvoiceUseCaseOutput,
} from "../../domain/invoice/usecases/IssueInvoice";
import { AfipVoucherInfo } from "../../domain/invoice/vo/AfipVoucherInfo";
import { Concept } from "../../domain/invoice/vo/Concept";
import { Day } from "../../domain/invoice/vo/Day";
import { InvoiceStatus } from "../../domain/invoice/vo/InvoiceStatus";
import { Money } from "../../domain/invoice/vo/Money";
import { PointOfSale } from "../../domain/invoice/vo/PointOfSale";
import { VoucherType } from "../../domain/invoice/vo/VoucherType";
import {
  CreateNextVoucherResult,
  CreateVoucherRequest,
  ElectronicBillingPort,
} from "../ports/ElectronicBillingPort";
import { IdempotencyStore } from "../ports/IdempotencyStore";

export class IssueInvoiceUseCaseImpl implements IssueInvoiceUseCase {
  constructor(
    private readonly repo: InvoiceRepository,
    private readonly ebill: ElectronicBillingPort,
    private readonly idem: IdempotencyStore,
  ) {}

  async execute(input: IssueInvoiceUseCaseInput): Promise<IssueInvoiceUseCaseOutput> {
    // Idempotencia por externalId o header
    const idemKey = input.externalId ?? input.idempotencyKey ?? null;
    if (idemKey) {
      const existed = await this.idem.get(idemKey);
      if (existed) {
        const inv = await this.repo.findById(existed.invoiceId);
        if (inv) {
          return { invoice: inv };
        }
      }
    }

    const inv: Invoice = Invoice.builder()
      .id(uuid())
      .externalId(input.externalId || "")
      .status(InvoiceStatus.Draft) // TODO: hardcoded - extract use case?
      .voucherType(VoucherType.C) // TODO: hardcoded - extract use case?
      .idDocument(input.idDocument)
      .total(Money.fromTotal(input.amount))
      .concept(Concept.from(input.concept))
      .serviceFrom(input.serviceFrom)
      .serviceTo(input.serviceTo)
      .pointOfSale(PointOfSale.from(input.pointOfSale))
      .date(Day.today())
      .build();

    const issuingInv = inv.markIssuing();

    // Payload WSFE para Factura C (IVA 0)
    const data: CreateVoucherRequest = {
      CantReg: 1,
      PtoVta: issuingInv.pointOfSaleValue(),
      CbteTipo: issuingInv.voucherType,
      Concepto: issuingInv.conceptValue(),
      DocTipo: issuingInv.docType(),
      DocNro: issuingInv.docNumber(),
      CbteFch: issuingInv.dateValue(),
      ImpTotal: issuingInv.totalAmount(),
      ImpTotConc: 0,
      ImpNeto: issuingInv.totalAmount(),
      ImpOpEx: 0,
      ImpIVA: 0,
      ImpTrib: 0,
      MonId: issuingInv.currency(),
      MonCotiz: 1,
      ...(issuingInv.isServiceConcept()
        ? {
            FchServDesde: issuingInv.serviceFrom?.numericDate,
            FchServHasta: issuingInv.serviceTo?.numericDate,
          }
        : {}),
    };

    try {
      const res: CreateNextVoucherResult = await this.ebill.createNextVoucher(data);
      // TODO: Mapping from response to VO:
      const afipResponse: AfipVoucherInfo = {
        cae: res.CAE,
        caeExpiration: res.CAEFchVto,
        voucherNumber: res.voucherNumber,
        afipResponse: res.rawResponse,
      };
      const issuedInv = issuingInv.markIssued(afipResponse);
      await this.repo.save(issuedInv);
      if (idemKey) {
        await this.idem.put(idemKey, issuedInv.id);
      }
      return { invoice: issuedInv };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const failedInv = issuingInv.markFailed();
      await this.repo.save(failedInv);
      throw e;
    }
  }
}
