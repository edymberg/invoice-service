// TODO: Implementar QR según especificación oficial AFIP/ARCA.
// Por ahora construye un link base64-url con datos esenciales.
export class AfipQrServiceStub {
  buildQrUrl(data: {
    cuit: number;
    ptoVta: number;
    tipoCmp: number;
    nroCmp: number;
    importe: number;
    moneda: string;
    ctz: number;
    tipoDocRec: number;
    nroDocRec: number;
    fechaCbte: number; // yyyymmdd
    codAut: string;
  }): string {
    const payload = { ver: 1, ...data };
    const base = "https://www.afip.gob.ar/fe/qr/"; // placeholder
    const p = Buffer.from(JSON.stringify(payload)).toString("base64url");
    return `${base}?p=${p}`;
  }
}
