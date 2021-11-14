import { createServiceContainer, ServiceContainer } from "./serviceContainer";

describe("basic functionality", () => {
  const testSyncService = () => ({ sync: "service" });
  const testAsyncService = async () => ({
    async: "service",
  });
  const testLayeredInjection = async (services: ServiceContainer) => {
    const asyncService = await services.get(testAsyncService);
    const syncService = services.get(testSyncService);
    return {
      asyncService,
      syncService,
    };
  };

  it("creates a basic service container", () => {
    expect(createServiceContainer).not.toThrow();
  });

  it("lets us use sync service containers properly", () => {
    const container = createServiceContainer();
    const service = container.get(testSyncService);
    expect(service).toEqual({
      sync: "service",
    });
  });

  it("doesn't re-create containers on subsequent get calls", () => {
    const container = createServiceContainer();
    const mockFactory = jest.fn().mockReturnValue("yo");
    const service = container.get(mockFactory);

    expect(service).toEqual("yo");
    expect(container.get(mockFactory)).toEqual("yo");

    expect(mockFactory).toHaveBeenCalledTimes(1);
  });

  it("lets use async service containers properly", () => {
    const container = createServiceContainer();
    const service = container.get(testAsyncService);

    // Should be Promise<{ async: string }>
    // @ts-expect-error
    const typeCheck: { async: string } = service;
    expect(typeCheck).toEqual(service);

    return expect(service).resolves.toEqual({
      async: "service",
    });
  });

  it("passes service factories the container itself, so services can depend on other services", () => {
    const container = createServiceContainer();
    return expect(container.get(testLayeredInjection)).resolves.toEqual({
      syncService: {
        sync: "service",
      },
      asyncService: {
        async: "service",
      },
    });
  });

  it("allows us to determine which factories have been initialized", () => {
    const container = createServiceContainer();
    container.get(testAsyncService);

    expect(container.has(testAsyncService)).toEqual(true);
    expect(container.has(testSyncService)).toEqual(false);
  });

  it("allows us to delete specific services from containers", () => {
    const container = createServiceContainer();
    container.get(testAsyncService);

    expect(container.has(testAsyncService)).toEqual(true);

    container.delete(testAsyncService);

    expect(container.has(testAsyncService)).toEqual(false);
  });

  it("lets us prime service containers", () => {
    const container = createServiceContainer();
    const primedService = testSyncService();
    container.set(testSyncService, primedService);

    expect(container.get(testSyncService)).toEqual({
      sync: "service",
    });
  });
});

describe("types", () => {
  const serviceResult = {
    test: "123",
    doAThing: () => Promise.resolve("hello"),
  };
  const testService = async (container: ServiceContainer) => {
    return Promise.resolve(serviceResult);
  };

  it("types the testService properly", async () => {
    const container = createServiceContainer();
    const service = await container.get(testService);
    expect(service).toEqual(serviceResult);
  });
});
