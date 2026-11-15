# @apps/api — Trivio Hosted Cloud API

## Overview

The backend microservice and hosted API for Trivio Cloud features (`https://api.trivio.ink`).

## Planned Architecture

- **Framework:** NestJS
- **Database & ORM:** PostgreSQL + Prisma (only when persistent cloud features are implemented)
- **Deployment Destination:** `https://api.trivio.ink`
- **Responsibilities:**
  - Acquirer schedule synchronization and rate card directory
  - Cloud-synced settlement reconciliation processing
  - Multi-tenant merchant profile management
  - Webhooks for settlement events and discrepancies

## Architectural Boundaries

- **Separation of Concerns:** The hosted API is strictly isolated from `@trivio.ink/core` and `@trivio.ink/node`.
- **Developer-Owned Data:** Trivio does not mandate storing transactional data in the hosted cloud. Core calculation primitives run locally within developer infrastructure.

## Stage 1 Status

> **Documented Placeholder**: During Stage 1, this directory is reserved as a documented placeholder. Application scaffolding, NestJS modules, and Prisma schema definitions will be initialized in future milestones when hosted platform persistence is required.
