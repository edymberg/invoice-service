import { Token } from "./Token";

export interface CompositionRoot<T> {
  resolve(token: Token<T>): T;
}
