import request from 'supertest';
import { buildApp, App } from '../../src/app';
import { buildInvoiceServiceConfig } from '../../src/infrastructure/config/env';

jest.mock("../../framework/logging", () => ({
  PinoLoggerFactory: {
    configureLogger: jest.fn(),
    getLogger: jest.fn(() => ({
      debug: jest.fn(),
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
    })),
  },
}));

describe('Invoice API Integration Tests', () => {
  let app: App;
  const authToken = 'Bearer your_api_key_here';

  beforeAll(async () => {
    app = await buildApp(buildInvoiceServiceConfig());
  });

  describe('POST /invoices', () => {
    const validProductInvoiceRequest = {
      externalId: "test-invoice-123",
      monto: 100.50,
      cuit: 30712345678,
      concept: 1,
      pointOfSale: 1
    };

    const validServiceInvoiceRequest = {
      externalId: "test-service-invoice-123",
      monto: 200.00,
      cuit: 30712345678,
      concept: 2,
      serviceFrom: "2026-04-20",
      serviceTo: "2026-04-25",
      pointOfSale: 1
    };

    describe('Authentication', () => {
      it('should reject requests without valid API key', async () => {
        const response = await request(app)
            .post('/invoices')
            .set('Authorization', 'Bearer invalid-key')
            .send(validProductInvoiceRequest)
            .expect(401);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Unauthorized');
      });
    });

    describe('Product Invoices', () => {
      it('should create a product invoice successfully', async () => {
        const response = await request(app)
            .post('/invoices')
            .set('Authorization', authToken)
            .send(validProductInvoiceRequest)
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('cae');
        expect(response.body).toHaveProperty('caeVto');
        expect(response.body).toHaveProperty('voucherNumber');

        // TODO: test data base
      });
    });

    describe('Service Invoices', () => {
      it('should create a service invoice successfully', async () => {
        const response = await request(app)
            .post('/invoices')
            .set('Authorization', authToken)
            .send(validServiceInvoiceRequest)
            .expect(201);

        expect(response.body).toHaveProperty('id');
        expect(response.body).toHaveProperty('status');
        expect(response.body).toHaveProperty('cae');
        expect(response.body).toHaveProperty('caeVto');
        expect(response.body).toHaveProperty('voucherNumber');

        // TODO: test data base
      });
    });

    describe('Idempotency', () => {
      it('should handle idempotency - return same invoice for duplicate externalId', async () => {
        // First request
        const firstResponse = await request(app)
          .post('/invoices')
          .set('Authorization', authToken)
          .send(validProductInvoiceRequest)
          .expect(201);

        // Second request with same externalId
        const secondResponse = await request(app)
          .post('/invoices')
          .set('Authorization', authToken)
          .send(validProductInvoiceRequest)
          .expect(201);

        expect(firstResponse.body.id).toBe(secondResponse.body.id);
        expect(firstResponse.body.externalId).toBe(secondResponse.body.externalId);
      });
    });

    describe('Request Validations', () => {
      it('should return 400 for invalid request - DTOMappingException', async () => {
        const invalidRequest = {
          monto: 100.50
        };

        const response = await request(app)
          .post('/invoices')
          .set('Authorization', authToken)
          .send(invalidRequest)
          .expect(400);


        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body).toHaveProperty('details');
        expect(response.body).toHaveProperty('correlationId');
      });

      it('should return 400 for invalid request - DTOMappingException', async () => {
        const invalidRequest = {
          ...validServiceInvoiceRequest,
          serviceFrom: "invalid",
        };

        const response = await request(app)
          .post('/invoices')
          .set('Authorization', authToken)
          .send(invalidRequest)
          .expect(400);

        expect(response.body).toHaveProperty('error');
        expect(response.body.error).toBe('Validation failed');
        expect(response.body).toHaveProperty('details');
        expect(response.body).toHaveProperty('correlationId');
      });
    });
  });
});