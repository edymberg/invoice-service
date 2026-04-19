import { UseCaseInput, UseCaseOutput } from "./types";

// UseCaseInput representa el input del caso de uso a ser llamado por el handler. Puede ser visto
// como un comando o un query de entrada. Es importante que el Caso de Uso reciva un UseCaseInput sin
// importar el handler que lo esté enviando para poder simplificar la cantidad de mappings desde
// el handler hasta el caso de uso.

// UseCaseOutput representa el output del caso de uso a ser llamado por el handler. Puede ser visto
// como la salida de un comando o un query. Es importante que el Caso de Uso devuelva un UseCaseOutput sin
// importar el handler que lo esté recibiendo para poder simplificar la cantidad de mappings desde
// el caso de uso hasta el handler.

export interface UseCase<I extends UseCaseInput, O extends UseCaseOutput> {
  execute(input: I): Promise<O>;
}
