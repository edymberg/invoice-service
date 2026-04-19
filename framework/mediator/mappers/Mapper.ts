import { Args } from "../types";

export interface Mapper<I, O> {
  map(input: I, ...args: Args): O;
}
