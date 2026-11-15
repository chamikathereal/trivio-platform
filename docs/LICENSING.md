# Trivio Platform Software Licensing & Intellectual Property Policy

**Public Brand:** trivio.ink  
**Positioning:** Payment Settlement Intelligence  
**License Strategy:** Open-Source Developer SDKs + Paid Proprietary Cloud Services  
**Approval Reference:** `LIC-2026-001` (Revision 2 — Corporate Copyright Holder, 15 November 2026)

---

## 1. Executive Summary & Licensing Model

Trivio employs an **open-core distribution architecture**:

1. **Client Developer SDKs (`packages/*`):** Permissively open-sourced under the **Apache License, Version 2.0** (`Apache-2.0`) to encourage frictionless developer adoption, transparent local financial math, and deep integration into commercial ERP, POS, accounting, and billing systems.
2. **Trivio Cloud Platform (`apps/*`):** Proprietary commercial software governed by separate commercial agreements and service subscriptions (managed reconciliation engines, automated statement OCR/CSV parsing, live bank rate-card directories, and multi-tenant consoles).

---

## 2. Approved Open-Source SDK Packages

The following npm packages within this monorepo are licensed under the **Apache License, Version 2.0**:

| Package Name | Directory | License | Copyright Notice |
| :--- | :--- | :--- | :--- |
| **`@trivio.ink/core`** | `packages/core` | Apache-2.0 | `Copyright 2026 trivio.ink` |
| **`@trivio.ink/node`** | `packages/node` | Apache-2.0 | `Copyright 2026 trivio.ink` |
| **`@trivio.ink/react`** | `packages/react` | Apache-2.0 | `Copyright 2026 trivio.ink` |

Each package directory includes its own standalone, unmodified `LICENSE` file containing the official Apache 2.0 text and an accompanying `NOTICE` file.

### Permitted Commercial Use

Under Apache License 2.0, developers and enterprises are explicitly permitted to:
- Embed Trivio SDKs in commercial closed-source software (ERP, POS, billing engines, CRM).
- Run deterministic fee calculations and settlement date forecasts completely offline without cloud telemetry or fees.
- Modify and distribute the SDK code, provided that Apache-2.0 attribution, license notices, and documentation of modifications are preserved.
- Benefit from the explicit, royalty-free contributor patent grant and patent retaliation protections defined in Section 3 of Apache-2.0.

---

## 3. Copyright Ownership & Legal Entity Status

- **Approved Copyright Holder:** `trivio.ink`
- **Entity Type:** Registered company, as designated and authorized by the project owner.
- **Copyright Year:** `2026`
- **Previous Designation:** Supersedes previous individual author designation (`Chamika Gayashan`) under License Approval `LIC-2026-001` Revision 2.

> [!IMPORTANT]
> **Pre-Release Legal Verification Requirement:**  
> Prior to the first public, untagged release on the public npm registry or external distribution, the project owner must verify the company's exact registered legal entity name (e.g., `Trivio Technologies Inc.`, `Trivio Ltd`, etc.) and ensure appropriate contributor IP assignment agreements are formalized. If `trivio.ink` operates as a trading name, copyright and corporate registrations must align.

---

## 4. Excluded Rights & Proprietary Monorepo Boundaries

> [!WARNING]
> **Monorepo Boundary Notice:**  
> The presence of a file or application inside this monorepo does **NOT** imply that it is open-source. The root repository is **NOT** licensed under Apache-2.0.

The following applications, assets, and infrastructure are strictly excluded from the open-source Apache-2.0 grant and remain proprietary:

1. **Trivio Cloud Backend (`apps/api`):** Hosted NestJS microservices, bank webhook ingestion, database schemas (PostgreSQL / Prisma), and cloud billing APIs.
2. **Merchant Console (`apps/console`):** Proprietary SaaS dashboard for multi-tenant rate schedule management and settlement auditing.
3. **Marketing & Documentation Web Applications (`apps/web`, `apps/docs`):** Subject to separate proprietary or documentation licenses.
4. **Acquirer Reconciliation Engines:** Algorithms, bank statement parsers, and confidential acquirer interchange rate schedules.
5. **Private Infrastructure & Deployment:** GitHub Actions deployment secrets, cloud hosting configurations, and internal operational scripts.

*Recommendation:* For maximum IP isolation, confidential cloud service implementations (`apps/api`, `apps/console`) should be maintained in a separate private repository prior to enterprise production deployment.

---

## 5. Trademark & Brand Identity Protection

Apache License 2.0 (Section 6) explicitly does **not** grant permission to use the trade names, trademarks, service marks, or product names of the Licensor, except for reasonable and customary use in describing the origin of the Work.

The following brand assets are proprietary and reserved:
- **Brand Name:** `trivio.ink` / `Trivio`
- **Logo & Wordmarks:** All SVG, PNG, and vector visual identities.
- **Brand Color Palette:**
  - Midnight Navy: `#000b26`
  - Electric Cyan: `#00ffff`
  - Warm White: `#fffefa`

Third parties may not use Trivio trademarks in a manner that implies endorsement, sponsorship, or association without prior written consent.

---

## 6. Financial Integrity Disclaimer

Trivio SDKs provide deterministic **estimates** of merchant processing fees and forecasted settlement calendar dates based strictly on caller-supplied rule configurations and calendar policies. 

In accordance with Section 7 of Apache License 2.0:
- Trivio SDKs are provided on an "AS IS" basis, without warranties of any kind.
- The SDKs do not execute live bank transactions, hold client funds, or process primary account numbers (PAN).
- Developers and merchants remain solely responsible for validating local banking agreements, tax liabilities, and acquirer batch cut-offs.

---

## 7. Approval Record

| Field | Detail |
| :--- | :--- |
| **Document ID** | `LIC-2026-001` |
| **Revision** | 2 (Corporate Copyright Holder) |
| **Approval Date** | 15 November 2026 |
| **Status** | Owner Approved for Implementation |
| **Publication Authorization** | **NOT AUTHORIZED** (Packages remain `"private": true` pending Stage 3C-B2) |
