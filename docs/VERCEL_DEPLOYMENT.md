# Trivio Vercel Deployment & Production Operations Runbook

> **Target Audience:** Trivio Platform Engineers, DevOps Contributors, and System Owners.  
> **Status:** Stage 4A-D Production Deployment Runbook  
> **Canonical Repository:** `trivio-ink/trivio-platform`  
> **Target Domains:** `https://trivio.ink` (Marketing) · `https://docs.trivio.ink` (Documentation)

---

## 1. Architecture Overview

Trivio employs a multi-project monorepo hosting architecture on Vercel. Both applications (`apps/web` and `apps/docs`) reside in the same canonical repository (`trivio-ink/trivio-platform`) and share root npm workspace dependencies with the core financial engine (`@trivio.ink/core`).

```
                              ┌─────────────────────────────────────────┐
                              │ trivio-ink/trivio-platform (GitHub Repo)│
                              └───────────────────┬─────────────────────┘
                                                  │
                         ┌────────────────────────┴────────────────────────┐
                         │                                                 │
                         ▼                                                 ▼
             ┌───────────────────────┐                         ┌───────────────────────┐
             │  Vercel: trivio-web   │                         │  Vercel: trivio-docs  │
             │ Root: apps/web        │                         │ Root: apps/docs       │
             │ Domain: trivio.ink    │                         │ Domain: docs.trivio...│
             └───────────────────────┘                         └───────────────────────┘
```

---

## 2. Commercial Hosting & Plan Considerations

> [!IMPORTANT]
> **Vercel Plan Compliance for Commercial Organizations:**  
> The **Vercel Hobby Plan** terms restrict usage strictly to non-commercial, personal projects. Because Trivio is a commercial fintech platform with developer-facing SDKs and upcoming enterprise cloud tiers, the company must deploy under a **Vercel Pro Team Plan** ($20/seat/month) to maintain compliance with Vercel's Terms of Service.  
> *Do not deploy commercial merchant tools on personal Hobby accounts.*

---

## 3. Step-by-Step Vercel Project Setup

### Project A: Marketing Website (`trivio-web`)
1. Log in to your commercial Vercel Team dashboard and navigate to **[Add New Project](https://vercel.com/new)**.
2. Select **GitHub** as the Git provider and authorize the `trivio-ink` organization.
3. Import repository: `trivio-ink/trivio-platform`.
4. Configure Project Settings:
   - **Project Name:** `trivio-web`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click *Edit* and select `apps/web`.
   - **Include files outside root directory in the Build Step:** Keep **Checked** (ensures `@trivio.ink/core` is resolved from the monorepo root).
   - **Build Command:** Override or leave default:
     ```bash
     next build
     ```
     *(Vercel automatically detects the root `package-lock.json` and runs `npm install` from the monorepo root).*
   - **Output Directory:** Default (`.next`).
   - **Install Command:** Default (`npm install`).
5. Click **Deploy**.

### Project B: Developer Documentation Portal (`trivio-docs`)
1. From the Vercel Team dashboard, navigate to **[Add New Project](https://vercel.com/new)** again.
2. Select the same repository: `trivio-ink/trivio-platform`.
3. Configure Project Settings:
   - **Project Name:** `trivio-docs`
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click *Edit* and select `apps/docs`.
   - **Include files outside root directory in the Build Step:** Keep **Checked**.
   - **Build Command:** `next build`
   - **Output Directory:** Default (`.next`).
   - **Install Command:** Default (`npm install`).
4. Click **Deploy**.

---

## 4. Custom Domain & DNS Configuration (Spaceship Registrar)

Trivio's domain (`trivio.ink`) was registered through Spaceship. Vercel automatically provisions Let's Encrypt SSL/TLS certificates once DNS records are verified.

> [!CAUTION]
> **Preserve Existing DNS Records:**  
> Never replace the domain's authoritative nameservers without auditing existing records. Do NOT delete existing `MX` (email), `TXT` (SPF, DKIM, DMARC, site verification), or custom service records in Spaceship Advanced DNS.

### 4.1 DNS Mapping Table

| Domain / Subdomain | Target Vercel Project | Record Type | Host / Name | Target / Value | TTL |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **`trivio.ink`** | `trivio-web` | **A** | `@` (or blank) | `76.76.21.21` | Auto (300s) |
| **`www.trivio.ink`** | `trivio-web` *(Redirect to Apex)* | **CNAME** | `www` | `cname.vercel-dns.com.` | Auto (300s) |
| **`docs.trivio.ink`** | `trivio-docs` | **CNAME** | `docs` | `cname.vercel-dns.com.` | Auto (300s) |

### 4.2 Step-by-Step Domain Assignment in Vercel
1. In `trivio-web` project:
   - Navigate to **Settings** -> **Domains**.
   - Add `trivio.ink` and select *Recommend: Redirect www.trivio.ink to trivio.ink*.
   - If prompted for domain ownership verification, copy the `_vercel` TXT record into Spaceship DNS.
2. In `trivio-docs` project:
   - Navigate to **Settings** -> **Domains**.
   - Add `docs.trivio.ink`.
3. In Spaceship Dashboard:
   - Open **Domain List** -> Click `trivio.ink` -> **Advanced DNS**.
   - Add the **A** record for `@` pointing to `76.76.21.21`.
   - Add the **CNAME** record for `docs` pointing to `cname.vercel-dns.com.`.
   - Add the **CNAME** record for `www` pointing to `cname.vercel-dns.com.`.
4. Wait for propagation (typically 2-15 minutes). Vercel will show a green checkmark: **Valid Configuration**.

---

## 5. Preview & CI/CD Deployment Behavior

- **Production Deployments:** Any merge into `main` automatically triggers production builds for both `trivio-web` and `trivio-docs`.
- **Preview Deployments:** Pull Requests opened against `main` automatically generate isolated preview URLs (e.g., `trivio-platform-git-feat-xyz-trivio.vercel.app`).
- **Ignored Build Step (Optimization):**
  To prevent documentation PRs from unnecessarily rebuilding `apps/web` (and vice-versa), configure Vercel **Ignored Build Step** under Project Settings -> Git:
  - For `trivio-web`:
    ```bash
    git diff --quiet HEAD^ HEAD . ../../packages/
    ```
  - For `trivio-docs`:
    ```bash
    git diff --quiet HEAD^ HEAD . ../../packages/
    ```

---

## 6. Post-Deployment Verification & Smoke Tests

After DNS verification, execute the following operational smoke tests:

### 6.1 Marketing Website (`https://trivio.ink`)
- [ ] Apex domain `https://trivio.ink` serves HTTP 200 with valid SSL certificate.
- [ ] `https://www.trivio.ink` redirects with HTTP 308/301 to `https://trivio.ink`.
- [ ] Brand palette matches Midnight Navy (`#000b26`) and Electric Cyan (`#00ffff`).
- [ ] Interactive Calculator (`/calculator`):
  - Enter gross amount $10,000.00, MDR 2.65% + $0.30 fixed fee.
  - Verify computed gross ($10,000.00), deduction ($265.30), and net payout ($9,734.70).
  - Verify legal disclaimer banner is visible and states figures are non-binding estimates.
- [ ] Navigation links to `/sdks`, `/about`, `/cloud`, and `/contact` resolve cleanly.
- [ ] `https://trivio.ink/robots.txt` and `https://trivio.ink/sitemap.xml` return valid XML/text.

### 6.2 Documentation Portal (`https://docs.trivio.ink`)
- [ ] `https://docs.trivio.ink` serves HTTP 200 with valid SSL certificate.
- [ ] Sidebar navigation expands/collapses properly on desktop and mobile.
- [ ] Code block "Copy" buttons successfully copy snippets to clipboard.
- [ ] Quickstart pages (`/quickstart/core`, `/quickstart/node`, `/quickstart/react`) display real API contracts.
- [ ] Precision page (`/precision`) documents Round-Half-Up integer division (`roundHalfUpDiv`).

---

## 7. Incident Management & Rollback Strategy

1. **Instant Rollback in Vercel:**
   - If a production build introduces an issue, navigate to **Deployments** in the respective Vercel project.
   - Locate the previous successful deployment and click the `...` menu -> **Instant Rollback**.
   - Traffic switches to the previous deployment instantaneously without rebuilding or redeploying git branches.
2. **Git Revert:**
   - In the repository, revert the offending commit on `developer-branch`, submit a PR to `main`, and merge after CI verification.
3. **Emergency DNS Detach:**
   - If hosting must be unlinked immediately, remove the A record in Spaceship Advanced DNS.
