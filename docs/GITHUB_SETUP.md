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

# Ensure origin points to fork
git remote set-url origin https://github.com/chamikathereal/trivio-platform.git

# Ensure upstream points to the organization repository
git remote add upstream https://github.com/trivio-ink/trivio-platform.git
```

### Contribution Flow

1. Checkout feature branch locally from `main`:
   ```bash
   git checkout -b feat/your-feature
   ```
2. Commit changes following Conventional Commits.
3. Push to your fork (`origin`):
   ```bash
   git push -u origin feat/your-feature
   ```
4. Open a Pull Request from `chamikathereal/trivio-platform:feat/your-feature` to `trivio-ink/trivio-platform:main`.

## 2. Recommended Branch Protection Rules for `main`

The organization administrator should configure the following rules on `trivio-ink/trivio-platform`:

1. **Require a pull request before merging:**
   - Require at least 1 approving review.
   - Dismiss stale pull request approvals when new commits are pushed.
2. **Require status checks to pass before merging:**
   - Check name: `CI / validate` (runs typecheck, unit tests, and compilation).
   - Require branches to be up to date before merging.
3. **Disallow force pushes:** Prevent accidental history rewrites.
4. **Disallow deletions:** Prevent accidental branch deletion of `main`.

## 3. GitHub Actions Continuous Integration

The repository includes `.github/workflows/ci.yml`:

- **Triggers:** Pull requests targeting `main` and pushes to `main`.
- **Permissions:** Read-only (`contents: read`).
- **Steps:**
  1. Checks out repository source via `actions/checkout@v4`.
  2. Sets up Node.js 22 LTS with npm dependency caching via `actions/setup-node@v4`.
  3. Executes clean installation (`npm ci`).
  4. Runs complete verification (`npm run check`: build, typecheck, test).

## 4. GitHub Organization Profile (`trivio-ink`)

GitHub renders organization profile landing pages from a special repository named `.github` located at `https://github.com/trivio-ink/.github`.

A template profile README has been prepared in this repository at:
`.github/profile/README.md`

### Instructions to Activate:
1. Create a public repository named `.github` under the `trivio-ink` organization.
2. Add the file `profile/README.md` using the content prepared in this repository.
3. Commit and push to main. The profile will automatically display on `https://github.com/trivio-ink`.
