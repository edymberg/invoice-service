export interface ErrorResponseDTO {
  message: string;
  status: number;
  correlationId: string;
  details: {
    code: string;
    field: string;
    message: string;
  }[];
}
