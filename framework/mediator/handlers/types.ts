// This file defines branded types for use case inputs and outputs
// to prevent accidental mixing of different use case types and enforce
// the usage of the correct types on Use Cases definitions
declare const InboundDTOBrand: unique symbol;
declare const OutboundDTOBrand: unique symbol;

export type InboundDTO = {
  readonly [InboundDTOBrand]: true;
};

export type OutboundDTO = {
  readonly [OutboundDTOBrand]: true;
};
