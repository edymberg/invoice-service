// This file defines branded types for use case inputs and outputs
// to prevent accidental mixing of different use case types and enforce
// the usage of the correct types on Use Cases definitions
declare const UseCaseInputBrand: unique symbol;
declare const UseCaseOutputBrand: unique symbol;

export type UseCaseInput = {
  readonly [UseCaseInputBrand]: true;
};

export type UseCaseOutput = {
  readonly [UseCaseOutputBrand]: true;
};
