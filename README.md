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
