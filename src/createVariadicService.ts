import { ServiceContainer } from "./serviceContainer";

/**
 * Creates a service function that takes variables. The resulting service
 * will memoize calls to this service, and ensure that the service is only
 * invoked once _with the supplied arguments_ for the lifespan of the service
 * container (or until the service container is cleared).
 */
export function createVariadicService<T extends VariadicServiceFunction>(
  fn: T,
  options?: VariadicServiceOptions
): (
  container: ServiceContainer
) => (
  ...args: VariadicServiceFunctionWithoutContainer<Parameters<T>>
) => ReturnType<T> {
  const argumentHashingFunction =
    options?.argumentHashingFunction || JSON.stringify;
  const memoizationMap = new Map<string, ReturnType<T>>();

  return ((container: ServiceContainer) => {
    return (
      ...args: VariadicServiceFunctionWithoutContainer<Parameters<T>>
    ) => {
      const key = argumentHashingFunction(args);
      const value = memoizationMap.get(key);
      if (value) {
        return value;
      }
      const result = fn(container, ...args);
      memoizationMap.set(key, result);
      return result;
    };
  }) as any;
}

type VariadicServiceFunction = (
  container: ServiceContainer,
  ...args: any[]
) => any;

type VariadicServiceFunctionWithoutContainer<T extends unknown[]> = T extends [
  any,
  ...infer U
]
  ? U
  : never;

interface VariadicServiceOptions {
  /**
   * By default, the argument hashing function is JSON.stringify. This tends to
   * be sufficient for most uses, but in some cases, you may have circular objects
   * or other types that cannot be properly stringified. For these cases, you can
   * slot in your own argument hashing function to generate keys.
   */
  argumentHashingFunction?: (...args: any[]) => string;
}
