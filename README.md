# Service Container

A simple service container for TypeScript.

## Getting started

```bash
# Yarn
$ yarn add @baublet/service-container

# NPM
$ npm install --save @baublet/service-container
```

## Documentation

Service containers are lightweight wrappers around the javascript `Map` object that provide clear responsibilities and safe typing in your applications.

Containers should be scoped per request or other discrete unit of work. **They are not intended to be long-lived,** although they can be if necessary. Under the hood, we use a `Map` to store references to factories and their services.

Concepts:

- **Container** - our service container that manages services.
- **Service Factory** - a function that takes a service container and returns a service.
- **Service** - anything. This library doesn't care what your service is. It could be a function, an object, a class, any primitive, a promise returning any of the above, etc.
- **Variadic Service** - a service memoized by both a reference to the service factory _and_ the arguments passed to its invocation.

### Getting Started

```ts
import { createServiceContainer } from "@baublet/service-container";

// An asynchronous service factory that itself accesses another service, returning
// an async function that utilizes the container itself.
function priceService(container: ServiceContainer) {
  return async (sku: string) => {
    const database = await container.get(databaseService);
    database.getPrice(sku);
  };
}

// A service that we may never directly invoke outside of services, but keep in
// mind that services can return _anything_, including primitives, objects, etc.,
// and subsequent calls to fetch this service will return the original return
// value!
async function databaseService() {
  const database = new Database();
  await database.connect();
  return database;
}

// A variadic service! Subsequent calls to this function are memoized until the
// service container is cleared or this service is deleted.
const currencyConversionService = createVariadicService(
  async (
    container: ServiceContainer,
    fromNumber: number,
    fromCurrency: string,
    toCurrency: string
  ): number => {
    // 1. Call up other services as needed
    const database = await container.get(databaseService);
    // 2. Do some logic to determine currency conversions
    const toNumber = fromNumber * 2;
    // 3. Return the value!
    return toNumber;
  }
);

// An example of a synchronous service
function i18nService() {
  return {
    en: {
      sku: "SKU",
      price: "Price",
    },
  };
}

async function getProduct(sku: string, container = createServiceContainer()) {
  const priceService = container.get(priceService);
  const translations = container.get(i18nService);
  const currencyConversionService = container.get(
    currencyConversionService
  );

  const price = await priceService(sku);
  const adjustedPrice = await currencyConversionService(price, "USD", "EUR");

  return `${translations.en.price}: ${adjustedPrice}`;
}
```

## Contributing

This package is around 50 lines of code, so contributing has been made as simple as possible. Clone the package, and simple run `npm install`, and you're good to go!

### Tests

We require 100% test coverage. To run the tests:

```bash
$ npm run test
```

### Publishing new versions

Update the new version in `package.json`, push your code to the `main` branch, and run:

```bash
$ npm run publish-version
```

This will run our tests (ensuring we're at 100% coverage), build our TypeScript code, and publish the latest version to NPM.
