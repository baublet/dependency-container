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

### Getting Started

```ts
import { createServiceContainer } from "@baublet/service-container";

// An asynchronous service factory that itself accesses another service
async function priceService(container: ServiceContainer) {
  const database = await container.get(databaseService);
  return (sku: string) => database.getPrice(sku);
}

// A service that we may never directly invoke outside of services
async function databaseService() {
  const database = new Database();
  await database.connect();
  return database;
}

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
  const priceService = await container.get(priceService);
  const translations = container.get(i18nService);

  const price = await priceService(sku);

  return `${translations.en.price}: ${price}`;
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