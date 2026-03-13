export type InvoiceRequestDTO = {
  externalId: string | null;
  monto: number;
  dni: number | null;
  cuit: number | null;
  concept: number;
  serviceFrom: string | null;
  serviceTo: string | null;
  pointOfSale: number;
};
