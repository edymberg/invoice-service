import { IssueInvoiceUseCaseInput } from "../../../../../../domain/invoice/usecases/IssueInvoice";
import { InvoiceRequestDTO } from "../../dtos/InvoiceRequestDTO";
import { Mapper } from "../../../../../../../framework/Mapper";
import { CONCEPT } from "../../../../../../domain/invoice/vo/Concept";
import { DocumentType } from "../../../../../../domain/invoice/vo/Identification";
import { Identification } from "../../../../../../domain/invoice/vo/Identification";
import { Day } from "../../../../../../domain/invoice/vo/Day";

type RestDTOError = {
	path: string;
	code: string;
	message: string;
}[];

export class DTOMappingException extends Error {
	public readonly restDTOError: RestDTOError;

	constructor(message: string, restDTOError: RestDTOError) {
		super(message);
		this.restDTOError = restDTOError;
	}
}

export class FromInvoiceRequestDTOToIssueInvoiceUseCaseInputMapper implements Mapper<InvoiceRequestDTO, IssueInvoiceUseCaseInput> {
	public map(invoiceDTO: InvoiceRequestDTO, idk: string | undefined): IssueInvoiceUseCaseInput {
		this.validateDTO(invoiceDTO);

    const idDocument: Identification = Identification.builder()
      .type(invoiceDTO.dni ? DocumentType.DNI : (invoiceDTO.cuit ? DocumentType.CUIT : DocumentType.UNRECOGNIZED))
      .value(invoiceDTO.dni ? invoiceDTO.dni : (invoiceDTO.cuit ? invoiceDTO.cuit : Number.NaN))
      .build();

    const serviceFrom = invoiceDTO.concept === CONCEPT.SERVICES ? 
      Day.builder()
        .day(Number(invoiceDTO.serviceFrom?.split("-")[2]))
        .month(Number(invoiceDTO.serviceFrom?.split("-")[1]))
        .year(Number(invoiceDTO.serviceFrom?.split("-")[0]))
        .build() 
      : undefined;

    const serviceTo = invoiceDTO.concept === CONCEPT.SERVICES ? 
      Day.builder()
        .day(Number(invoiceDTO.serviceTo?.split("-")[2]))
        .month(Number(invoiceDTO.serviceTo?.split("-")[1]))
        .year(Number(invoiceDTO.serviceTo?.split("-")[0]))
        .build() 
      : undefined;

		return {
      externalId: invoiceDTO.externalId ?? null,
      amount: invoiceDTO.monto,
      idDocument,
      concept: invoiceDTO.concept === CONCEPT.PRODUCTS ? CONCEPT.PRODUCTS : CONCEPT.SERVICES,
      serviceFrom,
      serviceTo,
      pointOfSale: invoiceDTO.pointOfSale,
      idempotencyKey: idk,
    }
	}

	private validateDTO(invoiceDTO: InvoiceRequestDTO) {
		const restDTOError: RestDTOError = [];

		if(!!invoiceDTO.cuit && !!invoiceDTO.dni) {
			restDTOError.push({
				path: "cuit",
				code: "invalid",
				message: "Invoice Request DTO must have either cuit or dni but not both"
			});
			restDTOError.push({
				path: "dni",
				code: "invalid",
				message: "Invoice Request DTO must have either cuit or dni but not both"
			});
		}
		if(invoiceDTO.concept === CONCEPT.SERVICES && (!invoiceDTO.serviceFrom || !invoiceDTO.serviceTo)) {
			!invoiceDTO.serviceFrom && restDTOError.push({
				path: "serviceFrom",
				code: "invalid",
				message: "Invoice Request DTO must have serviceFrom when concept is services"
			});
			!invoiceDTO.serviceTo && restDTOError.push({
				path: "serviceTo",
				code: "invalid",
				message: "Invoice Request DTO must have serviceTo when concept is services"
			});
			invoiceDTO.serviceFrom?.split("-").length !== 3 && restDTOError.push({
				path: "serviceFrom",
				code: "invalid",
				message: "Invoice Request DTO must have serviceFrom in the format YYYY-MM-DD"
			});
			invoiceDTO.serviceTo?.split("-").length !== 3 && restDTOError.push({
				path: "serviceTo",
				code: "invalid",
				message: "Invoice Request DTO must have serviceTo in the format YYYY-MM-DD"
			});
		}
		if(invoiceDTO.monto <= 0) {
			restDTOError.push({
				path: "monto",
				code: "invalid",
				message: "Invoice Request DTO must have a positive amount"
			});
		}
		if(invoiceDTO.pointOfSale <= 0) {
			restDTOError.push({
				path: "pointOfSale",
				code: "invalid",
				message: "Invoice Request DTO must have a positive pointOfSale"
			});
		}
		if(invoiceDTO.concept !== CONCEPT.SERVICES && invoiceDTO.concept !== CONCEPT.PRODUCTS) {
			restDTOError.push({
				path: "concept",
				code: "invalid",
				message: "Invoice Request DTO must have a valid concept (products or services)"
			});
		}

		if(restDTOError.length > 0) {
			throw new DTOMappingException("There where errors mapping the given DTO", restDTOError);
		}
	}
}
