import { AbstractDTOValidator, DTOError } from "../../../../../../../framework/http";
import { Mapper } from "../../../../../../../framework/mediator";
import { GetInvoiceUseCaseInput } from "../../../../../../domain/invoice/usecases/GetInvoice";
import { GetInvoiceRequestDTO } from "../../dtos/GetInvoiceRequestDTO";

// TODO: find a mapstruct like plugin to do this

export class FromGetInvoiceRequestDTOToGetInvoiceQueryUseCaseInputMapper
  extends AbstractDTOValidator
  implements Mapper<GetInvoiceRequestDTO, GetInvoiceUseCaseInput>
{
  public map(dto: GetInvoiceRequestDTO): GetInvoiceUseCaseInput {
    this.validateDTO(dto);

    return {
      id: dto.id,
    } as GetInvoiceUseCaseInput;
  }

  protected doValidations(dto: GetInvoiceRequestDTO) {
    const dtoError: DTOError = [];

    if (!dto.id || dto.id.length === 0) {
      dtoError.push({
        path: "id",
        code: "invalid",
        message: "Get Invoice Request DTO must be a valid id",
      });
    }

    return dtoError;
  }
}
