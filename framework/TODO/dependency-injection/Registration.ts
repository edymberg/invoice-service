import { CompositionRoot } from "./CompositionRoot";
import { Token } from "./Token";

export type Factory<T> = (container: CompositionRoot<any>) => T;

export class Registration<T> {
  readonly token: Token<T>;

  private implementationClass?: new (...args: any[]) => T;
  private factoryFn?: Factory<T>;
  private valueInstance?: T;

  private isSingleton: boolean = false;

  constructor(token: Token<T>) {
    this.token = token;
  }

  useClass(implementation: new (...args: any[]) => T): this {
    this.ensureNoOtherBinding("class");
    this.implementationClass = implementation;
    return this;
  }

  useFactory(factory: Factory<T>): this {
    this.ensureNoOtherBinding("factory");
    this.factoryFn = factory;
    return this;
  }

  useValue(value: T): this {
    this.ensureNoOtherBinding("value");
    this.valueInstance = value;
    return this;
  }

  asSingleton(): this {
    this.isSingleton = true;
    return this;
  }

  get isValue(): boolean {
    return this.valueInstance !== undefined;
  }

  get isFactory(): boolean {
    return this.factoryFn !== undefined;
  }

  get isClass(): boolean {
    return this.implementationClass !== undefined;
  }

  get singleton(): boolean {
    return this.isSingleton;
  }

  get class(): new (...args: any[]) => T | undefined {
    return this.implementationClass;
  }

  get factory(): Factory<T> | undefined {
    return this.factoryFn;
  }

  get value(): T | undefined {
    return this.valueInstance;
  }

  private ensureNoOtherBinding(type: string) {
    const already =
      (this.implementationClass && "class") ||
      (this.factoryFn && "factory") ||
      (this.valueInstance !== undefined && "value");

    if (already) {
      throw new Error(
        `Token "${this.token.description}" was already bound using "${already}". ` +
          `Cannot rebind using "${type}".`,
      );
    }
  }
}
