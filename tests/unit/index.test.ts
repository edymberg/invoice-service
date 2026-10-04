describe("src/index.ts", () => {
  let mockConsoleLog: jest.SpyInstance;
  let mockConsoleError: jest.SpyInstance;
  const mockConfig = {
    port: 3000,
    apiKey: "test-key",
    mongo: { uri: "mongodb://localhost", db: "test" },
    arca: {
      environment: "local" as const,
      accessToken: "token",
      cuit: 12345678901,
      cert: "cert content",
      key: "key content",
    },
  };
  beforeEach(() => {
    mockConsoleLog = jest.spyOn(console, "log").mockImplementation();
    mockConsoleError = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    mockConsoleLog.mockRestore();
    mockConsoleError.mockRestore();
  });

  it("should build config and start server successfully", async () => {
    const mockApp = {
      listen: jest.fn((port, callback) => callback()),
    } as any;

    await jest.isolateModulesAsync(async () => {
      jest.doMock("../../src/app", () => ({
        buildApp: jest.fn().mockResolvedValue(mockApp),
      }));
      jest.doMock("../../src/infrastructure/config/env", () => ({
        buildInvoiceServiceConfig: jest.fn().mockReturnValue(mockConfig),
      }));

      const { buildApp } = await import("../../src/app");
      const { buildInvoiceServiceConfig } = await import("../../src/infrastructure/config/env");

      // Import the module to trigger execution
      await import("../../src/index");

      expect(buildInvoiceServiceConfig).toHaveBeenCalled();
      expect(buildApp).toHaveBeenCalledWith(mockConfig);
      expect(mockApp.listen).toHaveBeenCalledWith(mockConfig.port, expect.any(Function));
      expect(mockConsoleLog).toHaveBeenCalledWith(`Server listening on :${mockConfig.port}`);
    });
  });

  it("should handle errors when building app fails", async () => {
    const mockError = new Error("Build failed");

    await jest.isolateModulesAsync(async () => {
      jest.doMock("../../src/app", () => ({
        buildApp: jest.fn().mockRejectedValue(mockError),
      }));
      jest.doMock("../../src/infrastructure/config/env", () => ({
        buildInvoiceServiceConfig: jest.fn().mockReturnValue(mockConfig),
      }));

      const { buildApp } = await import("../../src/app");
      const { buildInvoiceServiceConfig } = await import("../../src/infrastructure/config/env");

      // Import the module to trigger execution
      await import("../../src/index");

      // Wait for the promise to settle
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(buildInvoiceServiceConfig).toHaveBeenCalled();
      expect(buildApp).toHaveBeenCalledWith(mockConfig);
      expect(mockConsoleError).toHaveBeenCalledWith("Something went wrong", mockError);
    });
  });

  it("should handle errors when listen fails", async () => {
    const mockApp = {
      listen: jest.fn((port, callback) => {
        callback(new Error("Listen failed"));
      }),
    } as any;

    await jest.isolateModulesAsync(async () => {
      jest.doMock("../../src/app", () => ({
        buildApp: jest.fn().mockResolvedValue(mockApp),
      }));
      jest.doMock("../../src/infrastructure/config/env", () => ({
        buildInvoiceServiceConfig: jest.fn().mockReturnValue(mockConfig),
      }));

      const { buildApp } = await import("../../src/app");
      const { buildInvoiceServiceConfig } = await import("../../src/infrastructure/config/env");

      // Import the module to trigger execution
      await import("../../src/index");

      // Wait for the promise to settle
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(buildInvoiceServiceConfig).toHaveBeenCalled();
      expect(buildApp).toHaveBeenCalledWith(mockConfig);
      expect(mockApp.listen).toHaveBeenCalled();
    });
  });
});
