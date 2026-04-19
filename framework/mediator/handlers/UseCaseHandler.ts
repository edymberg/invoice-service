import { InboundDTO, OutboundDTO } from "./types";
import { Args } from "../types";

// Los UseCaseHandlers son los encargados de ejecutar los casos de uso y retornar los resultados.
// Cada UseCaseHandler debe implementar la interfaz UseCaseHandler y definir su propio input y output.
// Estos objetos son utilizados por los Controladores en el protocolo http, por los Listeners en el
// protocolo de eventos, y asi sucesivamente.

// InboundDTO representa un objeto DTO que ha llegado hasta el handler desde cualquier protocolo
// como ser: HTTP, GRPC, Eventos, etc.

// OutboundDTO representa un objeto DTO devuelto por el handler hacia cualquier protocolo
// como ser: HTTP, GRPC, Eventos, etc y alli convertida a lo que corresponda segun
// la capa de presentacion necesaria para ese protocolo.

export interface UseCaseHandler<I extends InboundDTO, O extends OutboundDTO> {
  handle(input: I, ...args: Args): Promise<O>;
}
