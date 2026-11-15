import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { SettlementCalculator } from "@/components/calculator";
import { CodeBlock } from "@/components/code-block";
import {
  ShieldCheck,
  Cpu,
  Calendar,
  Layers,
  ArrowRight,
  Terminal,
  Database,
  CheckCircle,
} from "lucide-react";

const codeExample = `import { calculatePaymentSettlementEstimate } from "@trivio.ink/core";

// Deterministic settlement estimate
const estimate = calculatePaymentSettlementEstimate({
  grossMinor: 1000000n, // $10,000.00 represented in minor currency units (cents)
  feeRule: {
    percentageBps: 250, // 2.50% Merchant Discount Rate (MDR)
    fixedFeeMinor: 1500n, // $15.00 fixed acquirer deduction
  },
  settlementPolicy: {
    cycleDays: 1, // T+1 settlement cycle
    cutOffTimeUtc: "16:00", // Acquirer batch cut-off time
    weekendHandling: "NEXT_BUSINESS_DAY",
    holidays: ["2026-12-25", "2027-01-01"],
  },
  transactionTimeUtc: "2026-11-16T17:30:00Z", // Past cut-off window
});

console.log(estimate.netMinor); 
// 973500n -> Exactly $9,735.00 net settlement without IEEE-754 floating point loss
console.log(estimate.expectedSettlementDate); 
// "2026-11-18" -> Shifted past cut-off to Wednesday clearance`;

export default function HomePage() {
  return (
    <div className="space-y-24 py-12 md:py-20">
      {/* 1. Hero Section */}
      <section className="container mx-auto px-4 sm:px-6 text-center space-y-8">
        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-trivio-subtle px-4 py-1.5 text-xs text-trivio-cyan shadow-sm">
          <span className="h-2 w-2 rounded-full bg-trivio-cyan animate-pulse" />
          <span>Stage 3C Complete — Trivio SDKs v0.1.0 Now Live on npm</span>
        </div>

        <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-trivio-warm max-w-4xl mx-auto leading-tight">
          Payment Settlement{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-trivio-cyan to-teal-200 cyan-text-glow">
            Intelligence
          </span>{" "}
          for Engineers
        </h1>

        <p className="text-base sm:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
          Deterministic fee calculation engines and settlement calendar forecasting. Model MDR, acquirer fees, and holiday-aware clearance cycles locally in developer infrastructure with <strong>zero float math</strong>.
        </p>

        {/* CTA Group */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button asChild size="lg" className="w-full sm:w-auto gap-2">
            <Link href="/calculator">
              <Terminal className="w-4 h-4" />
              Try Interactive Calculator
            </Link>
          </Button>

          <Button asChild size="lg" variant="outline" className="w-full sm:w-auto gap-2">
            <Link href="/sdks">
              <Layers className="w-4 h-4 text-trivio-cyan" />
              Explore the 3 SDKs
            </Link>
          </Button>
        </div>

        {/* Quick Install Bar */}
        <div className="max-w-md mx-auto pt-4">
          <div className="flex items-center justify-between rounded-lg border border-trivio-border bg-trivio-navy/80 px-4 py-3 font-mono text-xs text-gray-300 shadow-inner">
            <span className="text-trivio-cyan">$</span>
            <span className="select-all">npm install @trivio.ink/core</span>
            <Badge variant="secondary" className="text-[10px]">Apache-2.0</Badge>
          </div>
        </div>
      </section>

      {/* 2. Core Pillars / Why Trivio */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-trivio-warm">
            Engineered for Financial Accuracy
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            Traditional payment SDKs assume simplistic float math and static settlement. Trivio solves the four hardest problems in payment reconciliation.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="border-trivio-border bg-trivio-navy/60">
            <CardHeader className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-trivio-cyan">
                <Cpu className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Zero-Float Precision</CardTitle>
              <CardDescription>
                Calculations execute strictly in integer minor units with BigInt intermediate precision. Eliminates IEEE-754 penny-rounding errors.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-trivio-border bg-trivio-navy/60">
            <CardHeader className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-trivio-cyan">
                <Calendar className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Holiday & Cut-Off Aware</CardTitle>
              <CardDescription>
                Accurately models T+N settlement cycles, daily bank cut-off windows, and regional public holidays across worldwide clearing networks.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-trivio-border bg-trivio-navy/60">
            <CardHeader className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-trivio-cyan">
                <Database className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Developer-Owned Data</CardTitle>
              <CardDescription>
                Calculation engines run 100% locally in your Node.js or browser runtime. No mandatory cloud telemetry and zero raw cardholder data required.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-trivio-border bg-trivio-navy/60">
            <CardHeader className="space-y-2">
              <div className="h-10 w-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-trivio-cyan">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Apache-2.0 Open Source</CardTitle>
              <CardDescription>
                Free and open-source SDKs for Core, Node.js, and React. Zero runtime dependencies in @trivio.ink/core for maximum reliability.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* 3. Interactive Calculator Demo Section */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-10">
          <Badge variant="cyan">Live Web Demonstration</Badge>
          <h2 className="text-3xl sm:text-4xl font-bold text-trivio-warm">
            Interactive Settlement Calculator
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto">
            Test the live calculation engine right in your browser. Configure transaction amounts, merchant fee agreements, and settlement calendar policies.
          </p>
        </div>

        <SettlementCalculator />
      </section>

      {/* 4. Three SDKs Overview */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <h2 className="text-3xl font-bold text-trivio-warm">
            The Three Trivio SDKs
          </h2>
          <p className="text-sm text-gray-400 max-w-xl mx-auto">
            A modular monorepo architecture designed for seamless backend, frontend, and offline ledger integrations.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Core */}
          <Card className="border-trivio-border bg-trivio-navy/70 flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="cyan">Zero Runtime Deps</Badge>
                <span className="text-xs font-mono text-gray-400">v0.1.0</span>
              </div>
              <CardTitle className="text-xl">@trivio.ink/core</CardTitle>
              <CardDescription>
                Deterministic mathematical calculation engine. Computes percentage MDR, fixed transaction fees, and settlement dates across calendars.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded border border-trivio-border/60 bg-trivio-midnight p-2.5 font-mono text-xs text-gray-300">
                npm i @trivio.ink/core
              </div>
              <ul className="text-xs space-y-1.5 text-gray-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Pure TypeScript calculation engine
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Works offline in any runtime
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Node */}
          <Card className="border-trivio-border bg-trivio-navy/70 flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="cyan">Server SDK</Badge>
                <span className="text-xs font-mono text-gray-400">v0.1.0</span>
              </div>
              <CardTitle className="text-xl">@trivio.ink/node</CardTitle>
              <CardDescription>
                Server-side SDK foundation for backend services, ERPs, and payment gateways. Includes TrivioClient and BigInt-safe ledger serialization.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded border border-trivio-border/60 bg-trivio-midnight p-2.5 font-mono text-xs text-gray-300">
                npm i @trivio.ink/node
              </div>
              <ul className="text-xs space-y-1.5 text-gray-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Pre-configured client instances
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Crash-free JSON ledger snapshots
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* React */}
          <Card className="border-trivio-border bg-trivio-navy/70 flex flex-col justify-between">
            <CardHeader className="space-y-3">
              <div className="flex items-center justify-between">
                <Badge variant="cyan">UI Components</Badge>
                <span className="text-xs font-mono text-gray-400">v0.1.0</span>
              </div>
              <CardTitle className="text-xl">@trivio.ink/react</CardTitle>
              <CardDescription>
                Ready-to-use React UI components and hooks for merchant portals. Includes TrivioSettlementSummary, TrivioFeeBreakdown, and formatters.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded border border-trivio-border/60 bg-trivio-midnight p-2.5 font-mono text-xs text-gray-300">
                npm i @trivio.ink/react
              </div>
              <ul className="text-xs space-y-1.5 text-gray-400">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Currency exponent-aware formatting
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
                  Accessible React component trees
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="text-center pt-8">
          <Button asChild variant="outline">
            <Link href="/sdks" className="gap-2">
              View Detailed SDK Integration Guide <ArrowRight className="w-4 h-4" />
            </Link>
          </Button>
        </div>
      </section>

      {/* 5. Developer Code Demo */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-5 space-y-4">
            <Badge variant="cyan">Developer Experience</Badge>
            <h2 className="text-3xl font-bold text-trivio-warm">
              Deterministic Calculations in 5 Lines of Code
            </h2>
            <p className="text-sm text-gray-400 leading-relaxed">
              Integrate Trivio into your payment authorization pipelines, backend checkout handlers, or batch payout workers. All types are strictly validated at compile-time.
            </p>
            <div className="space-y-2 text-xs text-gray-300">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Zero dependency risk in calculation primitives</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Supports dynamic tiers, minimum fee thresholds, and caps</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                <span>Explicit rounding policy (Round-Half-Even / Banker&apos;s Rounding)</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-7">
            <CodeBlock
              title="settlement-example.ts"
              language="typescript"
              code={codeExample}
            />
          </div>
        </div>
      </section>

      {/* 6. Commercial Cloud Roadmap Preview */}
      <section className="container mx-auto px-4 sm:px-6">
        <div className="rounded-xl border border-trivio-border bg-gradient-to-b from-trivio-navy/80 to-trivio-midnight p-8 md:p-12 text-center space-y-6">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-400 font-semibold">
            <span>Planned Future Architecture</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-bold text-trivio-warm max-w-2xl mx-auto">
            The Future: Trivio Cloud Settlement Platform
          </h2>
          <p className="text-sm text-gray-400 max-w-2xl mx-auto leading-relaxed">
            While our core calculation SDKs will always remain 100% free and open-source, upcoming stages will introduce optional hosted cloud intelligence, acquirer batch reconciliation, and multi-tenant merchant portals.
          </p>
          <div className="pt-2">
            <Button asChild variant="default">
              <Link href="/cloud">Read the Trivio Cloud Roadmap</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
