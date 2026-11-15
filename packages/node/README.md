# @trivio.ink/node

> Server-side Node.js SDK foundation for Trivio Payment Settlement Intelligence.

## Overview

`@trivio.ink/node` is the official server-side client library for Node.js backends (Express, NestJS, Fastify, Koa, or custom microservices).

### Architectural Boundaries

- **Separation of Concerns:** Strictly isolated from the NestJS hosted cloud API (`apps/api`).
- **No Forced Persistence:** Zero mandatory database or PostgreSQL connections. Developers retain full ownership of their transaction data.
- **Offline Arithmetic Engine:** Integrates `@trivio.ink/core` directly for local, deterministic fee calculations without cloud network calls.
- **No Fake Mocking:** In Stage 1, does not fabricate network round-trips or fake banking credentials.

## Installation

Within the Trivio monorepo:

```json
{
  "dependencies": {
    "@trivio.ink/node": "*"
  }
}
```

## Usage

```typescript
import { TrivioClient } from '@trivio.ink/node';

// Offline deterministic usage (zero network calls)
const client = new TrivioClient();

const fee = client.calculateFee(1_000_000, 250);
console.log(fee);
// { grossMinor: 1000000, feeMinor: 25000, netMinor: 975000, rateBasisPoints: 250 }

// Configured for future Trivio Cloud integration
const cloudClient = new TrivioClient({
  apiKey: 'trv_test_key_sample',
  baseUrl: 'https://api.trivio.ink',
  timeoutMs: 5000,
});
console.log(cloudClient.isCloudConfigured); // true
```
