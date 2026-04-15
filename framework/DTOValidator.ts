export type RestDTOError = {
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

export interface DTOValidator {
  validateDTO(dto: unknown): void;
}

export abstract class AbstractDTOValidator implements DTOValidator {
  public validateDTO(dto: unknown) {
    const restDTOError: RestDTOError = this.doValidations(dto);

    if (restDTOError.length > 0) {
      throw new DTOMappingException("There where errors mapping the given DTO", restDTOError);
    }
  }

  protected abstract doValidations(dto: unknown): RestDTOError;
}
