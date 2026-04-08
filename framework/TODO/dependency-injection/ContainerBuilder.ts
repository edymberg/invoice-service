import { Container } from "./Container";
import { Registration } from "./Registration";
import { Token } from "./Token";

export class ContainerBuilder {
  private registrations = new Map();

  register<T>(token: Token<T>) {
    const reg = new Registration<T>(token);
    this.registrations.set(token, reg);
    return reg;
  }

  build(): Container {
    return new Container(this.registrations);
  }
}
