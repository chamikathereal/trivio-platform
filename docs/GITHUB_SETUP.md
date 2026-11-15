# Trivio GitHub Infrastructure & Repository Setup

## 1. Repository Architecture & Remotes

Trivio uses a standard fork-and-upstream Git workflow:

- **Upstream (Organization):** `https://github.com/trivio-ink/trivio-platform.git`
- **Origin (Developer Fork):** `https://github.com/chamikathereal/trivio-platform.git`

### Recommended Local Git Configuration

To synchronize between the developer fork and the upstream organization:

```bash
# Verify existing remotes
git remote -v

# Ensure origin points to your fork
git remote set-url origin https://github.com/chamikathereal/trivio-platform.git

# Ensure upstream points to the organization repository
git remote add upstream https://github.com/trivio-ink/trivio-platform.git
```

### The 14-Step Contribution Flow

1. `git fetch upstream`
2. `git checkout main && git merge --ff-only upstream/main`
3. `git switch -c feat/my-feature`
4. Implement scoped changes.
5. `npm run check`
6. Update documentation and `AGENTS.md`.
7. `git commit -m "feat(scope): concise description"`
8. `git push -u origin feat/my-feature`
9. Open a Pull Request from `chamikathereal/trivio-platform:feat/my-feature` to `trivio-ink/trivio-platform:main`.
10. Fill out all 13 sections in `.github/pull_request_template.md`.
11. Confirm CI checks (`CI / Validate Monorepo` and `PR Description Validator / Validate PR Description Quality`) pass.
12. Review code diff.
13. Merge after approval.
14. Synchronize fork `main` with upstream.

---

## 2. Recommended Branch Protection Rules for `main`

The organization administrator should configure the following rules on `trivio-ink/trivio-platform` under **Settings → Branches → Branch protection rules** for branch `main`:

> [!TIP]
> **Single-Maintainer Configuration:**
> To avoid deadlocking development when operating as a single maintainer, **do not require an independent peer approval** if no secondary reviewer is active. Instead, focus on automated status checks and preventing direct unreviewed pushes.

1. **Require a pull request before merging:**
   - Enables PR governance and automated validation.
   - For single maintainers: do *not* require approvals that block sole-author merges, or set required approvals to 0 while maintaining the PR gating requirement.
2. **Require status checks to pass before merging:**
   - Require branches to be up to date before merging.
   - Required status checks:
     - `Validate Monorepo` (from `.github/workflows/ci.yml`)
     - `Validate PR Description Quality` (from `.github/workflows/pr-description.yml`)
3. **Disallow force pushes:** Prevent history rewriting on `main`.
4. **Disallow deletions:** Prevent accidental branch deletion.
5. **Require linear history:** Enforces clean merge commits or squash merging.

---

## 3. GitHub Actions Workflows

The repository includes two automated workflows:

### A. Monorepo CI (`.github/workflows/ci.yml`)
- **Triggers:** Push to `main`, Pull Requests targeting `main`.
- **Permissions:** Read-only (`contents: read`).
- **Steps:**
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` (Node.js 22 LTS with npm cache)
  3. `npm ci` (clean installation)
  4. `npm run build` (TypeScript compilation across all workspaces)
  5. `npm run typecheck` (strict TypeScript validation)
  6. `npm test` (Vitest test suite execution)

### B. PR Description Validator (`.github/workflows/pr-description.yml`)
- **Triggers:** Pull Request `[opened, edited, synchronize, reopened]` targeting `main`.
- **Permissions:** Read-only (`contents: read`, `pull-requests: read`).
- **Steps:**
  1. `actions/checkout@v4`
  2. `actions/setup-node@v4` (Node.js 22 LTS)
  3. `node scripts/validate-pr-description.mjs` (verifies all 13 sections from `.github/pull_request_template.md` are documented without unresolved placeholders)

---

## 4. Public Repository Visibility Advisory

Both the upstream organization repository and developer forks are currently **public**.
- Maintainers must never commit proprietary bank rate schedules, client merchant contracts, confidential merchant discount rates, or production credentials.
- All code committed to the repository is subject to public inspection.

---

## 5. GitHub Organization Profile (`trivio-ink`)

GitHub renders organization profile landing pages from a special repository named `.github` located at `https://github.com/trivio-ink/.github`.

A template profile README has been prepared in this repository at:
`.github/profile/README.md`

### Instructions to Activate:
1. Create a public repository named `.github` under the `trivio-ink` organization.
2. Add the file `profile/README.md` using the content prepared in this repository.
3. Commit and push to main. The profile will automatically display on `https://github.com/trivio-ink`.
