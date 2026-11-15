## Description

<!-- Provide a clear, concise summary of the changes introduced in this pull request. -->

## Affected Workspaces

- [ ] `@trivio.ink/core`
- [ ] `@trivio.ink/node`
- [ ] `@trivio.ink/react`
- [ ] `apps/web`
- [ ] `apps/console`
- [ ] `apps/docs`
- [ ] `apps/api`
- [ ] Root / CI / Documentation

## Verification Checklist

- [ ] `npm run check` passes locally (`npm run build`, `npm run typecheck`, `npm test`)
- [ ] Added or updated unit tests with Vitest covering changes
- [ ] No floating-point math introduced into financial calculations
- [ ] No hardcoded acquirer rates, policies, or bank credentials
- [ ] No secrets, API keys, or `.env` files tracked in Git
- [ ] TypeScript declaration files (`.d.ts`) compile cleanly
- [ ] Adheres to conventional commits and project documentation standards
