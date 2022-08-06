export type ServiceFactory<T = any> = (serviceContainer: ServiceContainer) => T;

type ServiceFactoryResult<T> = T extends (serviceContainer: ServiceContainer) => Promise<infer R>
  ? Promise<R>
  : T extends (serviceContainer: ServiceContainer) => infer R
  ? R
  : never;

export type ServiceContainer = {
  getAll: () => {factory: unknown, service: unknown }[];
  get<T extends ServiceFactory>(factory: T): ServiceFactoryResult<T>;
  set<T extends ServiceFactory>(
    factory: T,
    service: ServiceFactoryResult<T>
  ): ServiceFactoryResult<T>;
  has(factory: ServiceFactory): boolean;
  delete(factory: ServiceFactory): void;
};

export const createServiceContainer: () => ServiceContainer = () => {
  const serviceMap: Map<ServiceFactory, any> = new Map();

  const serviceContainer: ServiceContainer = {
    getAll: () => {
      const result: {factory: unknown, service: unknown }[] = [];
      serviceMap.forEach((service, factory) => {
        result.push({
          factory,
          service
        });
      });
      return result;
    },
    get: (factory) => {
      if (!serviceMap.has(factory)) {
        serviceMap.set(factory, factory(serviceContainer));
      }
      return serviceMap.get(factory);
    },
    set: (factory, service) => {
      serviceMap.set(factory, service);
      return service;
    },
    has: (factory) => {
      return serviceMap.has(factory);
    },
    delete: (factory) => {
      serviceMap.delete(factory);
    },
  };

  return serviceContainer;
};
