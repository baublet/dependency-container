export type ServiceFactory = (serviceContainer: ServiceContainer) => any;

type ServiceFactoryResult<T> = T extends (serviceContainer: ServiceContainer) => Promise<infer R>
  ? R
  : T extends (serviceContainer: ServiceContainer) => infer R
  ? R
  : never;

export type ServiceContainer = {
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
