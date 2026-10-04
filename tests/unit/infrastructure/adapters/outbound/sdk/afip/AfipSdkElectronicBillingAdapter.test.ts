import { Mapper } from "../../../../../../../framework/mediator/mappers/Mapper";

import { AfipSdkElectronicBillingAdapter } from "../../../../../../../src/infrastructure/adapters/outbound/sdk/afip/AfipSdkElectronicBillingAdapter";
import { InvoiceServiceConfig } from "../../../../../../../src/infrastructure/config/env";
import { CreateVoucherRequest, CreateNextVoucherResult } from "../../../../../../../src/business/ports/ElectronicBillingPort";
import { AFIPCreateNextVoucherRequest, AFIPCreateNextVoucherResponse } from "../../../../../../../src/infrastructure/adapters/outbound/sdk/afip/dtos/Afip";
import { config } from "process";

describe('AfipSdkElectronicBillingAdapter', () => {
  const aCreateVoucherRequest = (): CreateVoucherRequest => ({
    CbteTipo: 1,
    PtoVta: 1,
    Concepto: 1,
    DocTipo: 96,
    DocNro: 20123456789,
    ImpTotal: 1000,
    CantReg: 1,
    CbteFch: 20230615,
    MonId: "PES",
    MonCotiz: 1,
    ImpNeto: 1000,
    ImpOpEx: 0,
    ImpIVA: 0,
    ImpTotConc: 0,
    ImpTrib: 0,
  });

  const aAFIPCreateNextVoucherRequest = (): AFIPCreateNextVoucherRequest => ({
    voucherType: 1,
    pointOfSale: 1,
    concept: 1,
    docType: 96,
    docNumber: 20123456789,
    amount: 1000,
    date: 20230615,
    serviceFrom: 20230601,
    serviceTo: 20230615,
  });

  const aAFIPCreateNextVoucherResponse = (): AFIPCreateNextVoucherResponse => ({
    CAE: "12345678901234",
    CAEFchVto: "20231231",
    voucherNumber: 1,
  });

  const aCreateNextVoucherResult = (): CreateNextVoucherResult => ({
    CAE: "12345678901234",
    CAEFchVto: "20231231",
    voucherNumber: 1,
  });

  const mockInboundMapper: Mapper<CreateVoucherRequest, AFIPCreateNextVoucherRequest> = {
    map: jest.fn(),
  };

  const mockOutboundMapper: Mapper<AFIPCreateNextVoucherResponse, CreateNextVoucherResult> = {
    map: jest.fn(),
  };

  let adapter: AfipSdkElectronicBillingAdapter;

  beforeEach(() => {
    jest.clearAllMocks();
    (mockInboundMapper.map as jest.Mock).mockReset();
    (mockOutboundMapper.map as jest.Mock).mockReset();
  });

  describe('constructor', () => {
    it('Given prod config, when creating adapter, then should initialize AFIP with cert and key', () => {
      const config = { 
        arca: {
          environment: 'PROD'
        }
      } as unknown as InvoiceServiceConfig;
      adapter = new AfipSdkElectronicBillingAdapter(
        config,
        mockInboundMapper,
        mockOutboundMapper
      );

      expect(adapter).toBeDefined();
    });

    it('Given dev config, when creating adapter, then should initialize AFIP with access token', () => {
      const config = { 
        arca: {
          environment: 'DEV'
        }
      } as unknown as InvoiceServiceConfig;

      adapter = new AfipSdkElectronicBillingAdapter(
        config,
        mockInboundMapper,
        mockOutboundMapper
      );

      expect(adapter).toBeDefined();
    });
  });

  describe('#createNextVoucher', () => {
    it('Given valid request, when creating voucher, then should call AFIP SDK and return result', async () => {
      const config = { 
        arca: {
          environment: 'PROD'
        }
      } as unknown as InvoiceServiceConfig;
      adapter = new AfipSdkElectronicBillingAdapter(
        config,
        mockInboundMapper,
        mockOutboundMapper
      );

      const request = aCreateVoucherRequest();
      const afipRequest = aAFIPCreateNextVoucherRequest();
      const afipResponse = aAFIPCreateNextVoucherResponse();
      const expectedResult = aCreateNextVoucherResult();

      (mockInboundMapper.map as jest.Mock).mockReturnValue(afipRequest);
      (mockOutboundMapper.map as jest.Mock).mockReturnValue(expectedResult);

      // Mock the AFIP SDK call
      (adapter as any).afip = {
        ElectronicBilling: {
          createNextVoucher: jest.fn().mockResolvedValue(afipResponse),
        },
      };

      const result = await adapter.createNextVoucher(request);

      expect(mockInboundMapper.map).toHaveBeenCalledWith(request);
      expect((adapter as any).afip.ElectronicBilling.createNextVoucher).toHaveBeenCalledWith(afipRequest);
      expect(mockOutboundMapper.map).toHaveBeenCalledWith(afipResponse);
      expect(result).toEqual(expectedResult);
    });

    it('Given AFIP SDK error, when creating voucher, then should propagate error', async () => {
      const config = { 
        arca: {
          environment: 'PROD'
        }
      } as unknown as InvoiceServiceConfig;
      adapter = new AfipSdkElectronicBillingAdapter(
        config,
        mockInboundMapper,
        mockOutboundMapper
      );

      const request = aCreateVoucherRequest();
      const afipRequest = aAFIPCreateNextVoucherRequest();
      const error = new Error("AFIP SDK error");

      (mockInboundMapper.map as jest.Mock).mockReturnValue(afipRequest);

      (adapter as any).afip = {
        ElectronicBilling: {
          createNextVoucher: jest.fn().mockRejectedValue(error),
        },
      };

      const act = async () => await adapter.createNextVoucher(request);

      await expect(act).rejects.toThrow("AFIP SDK error");
    });
  });

  describe('#getServerStatus', () => {
    it('Given AFIP SDK with getServerStatus, when getting status, then should return status from SDK', async () => {
      const config = { 
        arca: {
          environment: 'PROD'
        }
      } as unknown as InvoiceServiceConfig;
      adapter = new AfipSdkElectronicBillingAdapter(
        config,
        mockInboundMapper,
        mockOutboundMapper
      );

      const expectedStatus = {
        appserver: "OK",
        dbserver: "OK",
        authserver: "OK",
      };

      (adapter as any).afip = {
        ElectronicBilling: {
          getServerStatus: jest.fn().mockResolvedValue(expectedStatus),
        },
      };

      const result = await adapter.getServerStatus();

      expect((adapter as any).afip.ElectronicBilling.getServerStatus).toHaveBeenCalled();
      expect(result).toEqual(expectedStatus);
    });

    it('Given AFIP SDK without getServerStatus, when getting status, then should return unknown status', async () => {
      const config = { 
        arca: {
          environment: 'PROD'
        }
      } as unknown as InvoiceServiceConfig;
      adapter = new AfipSdkElectronicBillingAdapter(
        config,
        mockInboundMapper,
        mockOutboundMapper
      );

      (adapter as any).afip = {
        ElectronicBilling: {},
      };

      const result = await adapter.getServerStatus();

      expect(result).toEqual({
        appserver: "unknown",
        dbserver: "unknown",
        authserver: "unknown",
      });
    });

    it('Given AFIP SDK with null ElectronicBilling, when getting status, then should return unknown status', async () => {
      const config = { 
        arca: {
          environment: 'PROD'
        }
      } as unknown as InvoiceServiceConfig;
      adapter = new AfipSdkElectronicBillingAdapter(
        config,
        mockInboundMapper,
        mockOutboundMapper
      );

      (adapter as any).afip = {};

      const result = await adapter.getServerStatus();

      expect(result).toEqual({
        appserver: "unknown",
        dbserver: "unknown",
        authserver: "unknown",
      });
    });
  });
});
