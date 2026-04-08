/* eslint-disable @typescript-eslint/no-explicit-any */
import { Token } from "./Token";

type Clazz<T> = new (...args: any[]) => T;

export function injectParams<T>(aClass: Clazz<T>, deps: Token<any>[]) {
  Object.defineProperty(aClass, "__di_params__", {
    value: deps,
    writable: false,
    configurable: false,
    enumerable: false,
  });
}
