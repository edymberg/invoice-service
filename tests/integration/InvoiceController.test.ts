import request from 'supertest';
import { buildApp, App } from '../../src/app';
import { buildInvoiceServiceConfig } from '../../src/infrastructure/config/env';

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
          .expect(200);

        expect(firstResponse.body.id).toBe(secondResponse.body.id);
        expect(firstResponse.body.externalId).toBe(secondResponse.body.externalId);
      });
    });

    describe('Request Validations', () => {
      it('should return 400 for invalid request - missing required fields', async () => {
        const invalidRequest = {
          monto: 100.50
          // Missing concept and pointOfSale
        };

        const response = await request(app)
          .post('/invoices')
          .set('Authorization', authToken)
          .send(invalidRequest)
          .expect(400);

        expect(response.body).toHaveProperty('message');
        expect(response.body).toHaveProperty('details');
      });

      it('should return 400 for invalid request - negative amount', async () => {
        const invalidRequest = {
          ...validProductInvoiceRequest,
          monto: -50.00
        };

        const response = await request(app)
          .post('/invoices')
          .set('Authorization', authToken)
          .send(invalidRequest)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for service invoice without service dates', async () => {
        const invalidRequest = {
          externalId: "test-invalid-service",
          monto: 100.50,
          cuit: 30712345678,
          concept: 2,
          // Missing serviceFrom and serviceTo
          pointOfSale: 1
        };

        const response = await request(app)
          .post('/invoices')
          .set('Authorization', authToken)
          .send(invalidRequest)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });

      it('should return 400 for invalid CUIT format', async () => {
        const invalidRequest = {
          ...validProductInvoiceRequest,
          cuit: 123 // Too short CUIT
        };

        const response = await request(app)
          .post('/invoices')
          .set('Authorization', authToken)
          .send(invalidRequest)
          .expect(400);

        expect(response.body).toHaveProperty('message');
      });
    });


    // Note: Tests for AFIP errors and authorization issues should be implemented
    // as unit tests with mocked dependencies, as they require specific AFIP error conditions
    // that are difficult to reproduce in integration tests without actual AFIP credentials.
  });
});