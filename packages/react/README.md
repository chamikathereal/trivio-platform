# @trivio.ink/react

> Reusable React components and hooks for Trivio payment settlement intelligence.

## Overview

`@trivio.ink/react` provides foundational React UI components and hooks for merchant bank fee configuration, settlement previews, and MDR rate visualization.

### Architectural Principles

- **React Agnostic:** Compatible with any modern React 18+ environment (Next.js, Vite, Remix, etc.). Not locked to Next.js.
- **Peer Dependency:** Requires `react >= 18.0.0` as a peer dependency.
- **Client-Side Arithmetic:** Consumes `@trivio.ink/core` for instantaneous, deterministic client-side calculation preview without blocking on network round-trips.
- **Zero Database Lock-in:** No mandatory cloud database or server architecture required.

## Installation

Within the Trivio monorepo:

```json
{
  "dependencies": {
    "@trivio.ink/react": "*",
    "react": "^19.0.0"
  }
}
```

## API Reference

### `TrivioProvider` & `useTrivio`

Configures settlement display defaults (such as currency code and default fee rate) across child settlement components.

### `FeeBreakdown`

Accessible, semantic presentation component for displaying gross amount, fee deductions, and net settlement total based on `@trivio.ink/core` estimates.
