/* eslint-disable @typescript-eslint/no-explicit-any */
import { CompositionRoot } from "./CompositionRoot";
import { Registration } from "./Registration";
import { Token } from "./Token";

export class Container implements CompositionRoot<any> {
  private readonly registrations: Map<Token<any>, Registration<any>>;
  private readonly singletons = new Map<Token<any>, any>();
  private readonly resolving = new Set<Token<any>>();

  constructor(registrations: Map<Token<any>, Registration<any>>) {
    this.registrations = new Map(registrations);
  }

  resolve<T>(token: Token<T>): T {
    if (this.resolving.has(token)) {
      throw new Error(`Cyclic dependency detected while resolving token "${token.description}".`);
    }

    const reg = this.registrations.get(token);

    if (!reg) {
      throw new Error(
        `No registration found for token "${token.description}". ` +
          `Did you forget to register it in your Composition Root?`,
      );
    }

    if (reg.isValue) {
      return reg.value as T;
    }

    this.resolving.add(token);

    try {
      if (reg.singleton) {
        if (this.singletons.has(token)) {
          return this.singletons.get(token);
        }

        const instance = this.instantiate(reg);
        this.singletons.set(token, instance);
        return instance;
      }

      return this.instantiate(reg);
    } finally {
      this.resolving.delete(token);
    }
  }

  private instantiate<T>(reg: Registration<T>): T {
    if (reg.isFactory) {
      const instance = reg.factory?.(this);
      if (!instance) throw new Error(`${reg.token.description} factory returned undefined`);
      return instance;
    }

    if (reg.isClass) {
      const instance = this.instantiateClass(reg.class);
      if (!instance) {
        throw new Error(`${reg.token.description} class constructor returned undefined`);
      }
      return instance;
    }

    throw new Error(`Invalid registration for token "${reg.token.description}".`);
  }

  private instantiateClass<T>(cls: new (...args: any[]) => T): T {
    const paramTokens = this.getConstructorParamTypes(cls);

    if (cls.length !== paramTokens.length) {
      throw new Error(
        `Invalid DI metadata for class "${cls.name}".\n` +
          `→ Constructor expects ${cls.length} parameters\n` +
          `→ But DI metadata (__di_params__) defines ${paramTokens.length}\n\n` +
          `Fix: call injectParams(${cls.name}, [ ...tokens ]) in your Composition Root.`,
      );
    }

    const params = paramTokens.map((token: Token<any>, i: number) => {
      if (!(token instanceof Token)) {
        throw new Error(
          `Invalid DI metadata in "${cls.name}": constructor param #${i + 1} ` +
            `must be a Token<T>, but got: ${String(token)}.`,
        );
      }
      return this.resolve(token);
    });

    return new cls(...params);
  }

  private getConstructorParamTypes(cls: any): Token<any>[] {
    return (cls.__di_params__ ?? []) as Token<any>[];
  }
}
