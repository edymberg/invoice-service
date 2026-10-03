export type DTOError = {
  path: string;
  code: string;
  message: string;
}[];

export class DTOMappingException extends Error {
  public readonly error: DTOError;

  constructor(message: string, dtoError: DTOError) {
    super(message);
    this.error = dtoError;
  }
}

export interface DTOValidator {
  validateDTO(dto: unknown): void;
}

export abstract class AbstractDTOValidator implements DTOValidator {
  public validateDTO(dto: unknown) {
    const dtoError: DTOError = this.doValidations(dto);

    if (dtoError.length > 0) {
      throw new DTOMappingException("There where errors mapping the given DTO", dtoError);
    }
  }

  protected abstract doValidations(dto: unknown): DTOError;
}
