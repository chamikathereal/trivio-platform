# @trivio-apps/api — Trivio Cloud API & Data Persistence

The backend service for Trivio Cloud, providing multi-tenant workspace management, merchant configuration persistence, settlement calendar scheduling, append-only audit logging, and authorization-protected settlement calculations.

---

## 1. Architecture Overview

Built with **NestJS 10**, **TypeScript strict mode**, **Prisma ORM**, and **PostgreSQL 16+**.

```
apps/api/
├── src/
│   ├── main.ts                     # NestJS bootstrap, CORS, global validation pipe (/api/v1)
│   ├── app.module.ts               # Root module orchestrating feature domains
│   ├── config/                     # Strict environment variable validation
│   ├── database/                   # PrismaService lifecycle connection manager
│   ├── auth-boundary/              # Deny-by-default workspace security & RBAC guard
│   ├── workspaces/                 # Multi-tenant workspace CRUD & ownership transactions
│   ├── merchants/                  # Merchant profile management & currency configurations
│   ├── fee-agreements/             # MDR fee agreements, basis points, caps, versioning
│   ├── settlement-policies/        # T+N schedules, daily UTC cut-off windows, weekend shifts
│   ├── calendars/                  # Working day definitions & bank holiday date lists
│   ├── estimates/                  # Payout calculations calling @trivio.ink/core & durable snapshots
│   ├── audit/                      # Append-only tenant audit events
│   ├── health/                     # Public health check endpoint
│   └── contracts/                  # Exported TypeScript DTO contracts for console integration
├── prisma/
│   └── schema.prisma               # Relational data models and foreign key constraints
├── docker-compose.yml              # Local PostgreSQL 16 container definition
└── .env.example                    # Sample environment variables
```

---

## 2. PostgreSQL Data Models

The relational schema implements workspace-scoped records with foreign keys and unique constraints:

- **`Workspace`**: Tenant boundary for organizations.
- **`WorkspaceMember`**: Role-based membership (`OWNER`, `ADMIN`, `MEMBER`, `VIEWER`).
- **`UserIdentity`**: Authenticated actor reference for future Stage 4C.2 IdP integration.
- **`Merchant`**: Merchant profile scoped by `workspaceId` with unique `(workspaceId, code)`.
- **`FeeAgreement`**: Configurable MDR rates in integer basis points (`percentageBps`) and minor units (`fixedFeeMinor`, `minFeeMinor`, `maxFeeMinor`). Explicit zero-fee agreements supported.
- **`SettlementPolicy`**: T+0 through T+N cycles, 24-hour UTC cut-offs, IANA timezones, and weekend conventions (`following_business_day`, `preceding_business_day`, `no_adjustment`).
- **`SettlementCalendar`**: Banking holiday strings and working day integer arrays.
- **`EstimateRecord`**: Optional durable calculation snapshots marked as `status: "ESTIMATED"`.
- **`AuditEvent`**: Append-only audit records tracking resource mutations.

---

## 3. Tenant Isolation & Security Boundary

- **Deny-by-Default:** Any business CRUD endpoint without verified workspace credentials is automatically rejected (`401 Unauthorized`).
- **Stage 4C.2 Protection:** In `production`, business endpoints are blocked by default pending identity provider integration in Stage 4C.2.
- **Cross-Tenant Prevention:** All database operations are explicitly scoped to `workspaceId`. Cross-tenant foreign key linking (e.g., associating a fee agreement with another tenant's merchant) is strictly rejected with `403 Forbidden`.
- **Zero Cardholder Data:** Primary account numbers (PAN), CVVs, cardholder PINs, and banking credentials are never processed, accepted, or stored.

---

## 4. Local Development & Testing

### Running PostgreSQL Locally with Docker:
```bash
cd apps/api
docker compose up -d
```

### Running Prisma Migrations:
```bash
npx prisma migrate dev --name init
```

### Building & Running:
```bash
npm run build
npm run start
```
