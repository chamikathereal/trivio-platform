# Trivio npm Trusted Publishing Guide

> Step-by-step setup guide for OIDC-based npm Trusted Publishing with GitHub Actions.
> Eliminates permanent static npm tokens in favor of short-lived, cryptographically signed OIDC tokens.

---

## 1. Overview & Security Rationale

Traditional npm publishing relies on static, long-lived automation tokens stored as GitHub repository secrets. If a static token is leaked or compromised, malicious actors can publish compromised code to the public registry.

**npm Trusted Publishing** uses OpenID Connect (OIDC) between GitHub Actions and the npm registry:
- **Zero Secrets:** No permanent `NPM_TOKEN` secret is stored in GitHub.
- **Short-Lived Ephemeral Credentials:** GitHub Actions exchanges an OIDC cryptographic token for a short-lived (minutes) publication token directly with `registry.npmjs.org`.
- **Strict Boundary Enforcement:** Publications are permitted *only* from the official canonical repository (`trivio-ink/trivio-platform`), on approved release tags or workflows, preventing unauthorized forks from publishing.

---

## 2. Prerequisites for the Repository Owner

> [!IMPORTANT]
> The following steps require direct administrative access to the `trivio.ink` npm organization and can only be performed by the project owner. AI coding agents cannot create or configure these permissions.

1. **npm Organization Scope Ownership:**
   - Ensure the `@trivio.ink` organization scope is registered and owned by your npm account on [npmjs.com](https://www.npmjs.com).
2. **Two-Factor Authentication (2FA):**
   - Ensure your npm account has 2FA enabled (mandatory for npm publishing).

---

## 3. Configuring Trusted Publishing on npmjs.com

For each package (`@trivio.ink/core`, `@trivio.ink/node`, `@trivio.ink/react`):

1. Navigate to the package settings on npm (or organization publishing settings):
   - `https://www.npmjs.com/package/@trivio.ink/core/access`
2. Scroll to the **Publishing Access** / **Trusted Publishers** section.
3. Click **Add Publisher** -> **GitHub Actions**.
4. Configure the OIDC trust relationship:
   - **GitHub Organization / User:** `trivio-ink`
   - **Repository:** `trivio-platform`
   - **Workflow file name:** `release.yml` (or designated release workflow)
   - **Environment name:** (optional, e.g. `production`)

Repeat this configuration for `@trivio.ink/node` and `@trivio.ink/react`.

---

## 4. GitHub Actions Workflow Configuration (`release.yml`)

When ready for Stage 3C-B, the publication workflow utilizes GitHub's native `id-token: write` permission:

```yaml
name: Release Packages to npm

on:
  release:
    types: [published]

permissions:
  contents: read
  id-token: write # Mandatory for OIDC token exchange with npmjs.org

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Setup Node.js 22 LTS
        uses: actions/setup-node@v4
        with:
          node-version: 22
          registry-url: 'https://registry.npmjs.org'

      - name: Install dependencies
        run: npm ci

      - name: Run Release Quality Gate
        run: |
          npm run check
          npm run verify:release

      - name: Publish @trivio.ink/core
        run: npm publish --workspace=@trivio.ink/core --access public
        env:
          NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }} # Or OIDC provenance

      - name: Publish @trivio.ink/node
        run: npm publish --workspace=@trivio.ink/node --access public

      - name: Publish @trivio.ink/react
        run: npm publish --workspace=@trivio.ink/react --access public
```

---

## 5. Security & Verification Checklist Before First Publication

- [ ] All package manifests retain `"private": true` until owner explicitly approves Stage 3C-B.
- [ ] License agreement approved by repository owner.
- [ ] Automated release gate (`npm run verify:release`) passes with zero warnings.
- [ ] Zero `.env` files or credentials present in git tree.
