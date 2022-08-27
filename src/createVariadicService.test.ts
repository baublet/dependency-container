import { createVariadicService } from "./createVariadicService";
import { createServiceContainer } from "./serviceContainer";

it("produces a properly memoized function", () => {
  const container = createServiceContainer();
  const fn = jest.fn((container: any, ...args: number[]) => args);
  const memoizedService = createVariadicService(fn);
  const memoized = container.get(memoizedService);

  expect(memoized(1, 2, 3)).toEqual([1, 2, 3]);
  expect(memoized(1, 2, 3)).toEqual([1, 2, 3]);

  expect(fn).toHaveBeenCalledTimes(1);
});

it("accepts a custom argument hash function", () => {
  const container = createServiceContainer();
  const fn = jest.fn((container: any, ...args: number[]) => args);
  const memoizedService = createVariadicService(fn, {
    argumentHashingFunction: () => "one key only!",
  });
  const memoized = container.get(memoizedService);

  expect(memoized(1, 2, 3)).toEqual([1, 2, 3]);
  expect(memoized(2, 3, 4)).toEqual([1, 2, 3]);

  expect(fn).toHaveBeenCalledTimes(1);
});

it("passes the original container around", () => {
  const container = createServiceContainer();
  const fn = jest.fn((containerInstance: any, ...args: number[]) => {
    expect(containerInstance).toBe(container);
    return args;
  });
  const memoizedService = createVariadicService(fn, {
    argumentHashingFunction: () => "one key only!",
  });
  const memoized = container.get(memoizedService);

  expect(memoized(1, 2, 3)).toEqual([1, 2, 3]);

  expect(fn).toHaveBeenCalledTimes(1);
});
