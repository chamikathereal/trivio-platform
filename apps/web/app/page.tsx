import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SettlementCalculator } from "@/components/calculator";
import { HeavenlyHeroVisual } from "@/components/heavenly-hero-visual";
import { CodeBlock } from "@/components/code-block";
import {
  ShieldCheck,
  Cpu,
  Calendar,
  Layers,
  ArrowRight,
  Terminal,
  Database,
  ExternalLink,
  Sparkles,
} from "lucide-react";

const coreCode = `import { calculatePaymentSettlementEstimate } from "@trivio.ink/core";

// Deterministic settlement estimate
const estimate = calculatePaymentSettlementEstimate({
  grossMinor: 1000000n, // $10,000.00 in minor currency units (cents)
  feeRule: {
    percentageBps: 250,   // 2.50% Merchant Discount Rate (MDR)
    fixedFeeMinor: 1500n, // $15.00 fixed acquirer levy
  },
  settlementPolicy: {
    cycleDays: 2,         // T+2 clearance cycle
    cutOffTimeUtc: "16:00", // Acquirer cut-off window
    weekendHandling: "NEXT_BUSINESS_DAY",
    holidays: ["2026-12-25", "2027-01-01"],
  },
  transactionTimeUtc: "2026-11-16T17:30:00Z", // Past cut-off window
});

console.log(estimate.netMinor); 
// 973500n -> Exactly $9,735.00 net settlement without IEEE-754 float drift
console.log(estimate.expectedSettlementDate); 
// "2026-11-19" -> Shifted past cut-off to Thursday clearance`;

const nodeCode = `import { TrivioClient } from "@trivio.ink/node";

// Initialize server-side settlement client
const trivio = new TrivioClient({
  defaultFeeRule: {
    id: "MDR_ENTERPRISE",
    percentageBps: 220, // 2.20%
    fixedFeeMinor: 30n,  // $0.30
  },
  defaultSettlementPolicy: {
    id: "CYCLE_T1",
    cycleDays: 1,
    cutOffTimeUtc: "16:00",
  },
});

// Create immutable ledger entry for local database
const ledgerEntry = trivio.createLedgerRecord({
  transactionId: "tx_celestial_01",
  grossMinor: 500000n, // $5,000.00
  transactionTimeUtc: new Date().toISOString(),
});

// JSON-safe serialization without BigInt runtime errors
const payload = JSON.stringify(ledgerEntry);`;

const reactCode = `import React from "react";
import { TrivioSettlementSummary, TrivioFeeBreakdown } from "@trivio.ink/react";

export function PayoutCard({ estimate }) {
  return (
    <div className="p-6 rounded-2xl border border-border bg-card">
      <TrivioSettlementSummary 
        estimate={estimate} 
        currency="USD"
        variant="minimal" 
      />
      <TrivioFeeBreakdown 
        estimate={estimate} 
        showBasisPoints={true} 
      />
    </div>
  );
}`;

export default function HomePage() {
  return (
    <div className="space-y-24 sm:space-y-32 pb-16">
      {/* 1. Full-Bleed Heavenly Hero Section starting from top: 0 behind the navbar */}
      <section className="relative w-full -mt-20 pt-28 sm:pt-36 pb-16 sm:pb-24 overflow-hidden flex flex-col items-center justify-between min-h-[740px] md:min-h-[820px] lg:min-h-[880px]">
        {/* Full image as background with 100% full natural colors, ZERO blur, and correct proportions */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/angels-of-salvation.jpg"
            alt="Trivio — Angels of Salvation Ascending from Purgatory"
            fill
            priority
            className="object-cover object-center"
          />
          {/* Natural edge blend at the very bottom into page background */}
          <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-background via-background/40 to-transparent pointer-events-none" />
        </div>

        {/* Hero Content (Floating directly over the unblurred, full-color artwork) */}
        <div className="relative z-10 container mx-auto px-4 sm:px-6 text-center space-y-6 max-w-5xl my-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/50 backdrop-blur-md px-4 py-1.5 text-xs text-white shadow-xl">
            <Sparkles className="w-3.5 h-3.5 text-white" />
            <span>Stage 3C Complete — Trivio SDKs v0.1.0 Now Live on npm</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.08] drop-shadow-[0_4px_30px_rgba(0,0,0,0.95)]">
            Complex Math,{" "}
            <span className="font-serif italic font-normal tracking-normal text-zinc-200">
              Delivered to Heaven.
            </span>
          </h1>

          <p className="text-base sm:text-xl text-zinc-100 font-medium max-w-2xl mx-auto leading-relaxed drop-shadow-[0_2px_16px_rgba(0,0,0,0.95)]">
            Trivio is the <strong>Agent of Heaven</strong> sent to save payment engineers from the purgatory of complex financial calculations, IEEE-754 penny drift, and hidden bank fee drift.
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto gap-2 bg-white text-black hover:bg-zinc-200 shadow-2xl font-semibold">
              <Link href="/calculator">
                <Terminal className="w-4 h-4" />
                Launch Interactive Calculator
              </Link>
            </Button>

            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto gap-2 border-white/30 bg-black/40 text-white hover:bg-black/60 backdrop-blur-md shadow-xl">
              <Link href="/sdks">
                <Layers className="w-4 h-4" />
                Explore the 3 SDKs
              </Link>
            </Button>
          </div>

          {/* Quick CLI Bar */}
          <div className="max-w-md mx-auto pt-2">
            <div className="flex items-center justify-between rounded-full border border-white/25 bg-black/55 backdrop-blur-xl px-5 py-2.5 font-mono text-xs text-white shadow-2xl">
              <span className="text-zinc-400">$</span>
              <span className="select-all font-semibold">npm install @trivio.ink/core</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full border border-white/20 bg-white/10 text-white font-sans font-medium">
                Apache-2.0
              </span>
            </div>
          </div>

          {/* Mindly Orbiting Floating Cards over the lower portion of the artwork */}
          <HeavenlyHeroVisual />
        </div>
      </section>

      {/* 2. The Four Divine Decrees / Core Pillars */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center space-y-3 mb-14">
          <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold">
            Divine Accuracy
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Four Pillars of Financial Integrity
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Traditional payment libraries rely on simplistic floating-point math and static calendars. Trivio solves the four hardest reconciliation challenges.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Card 1 */}
          <Card className="hover:border-foreground/30 transition-all duration-300">
            <CardHeader className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground">
                <Cpu className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Zero-Float Precision</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Calculations execute strictly in integer minor units with BigInt precision. Eliminates IEEE-754 penny-rounding drift across multi-million transaction ledgers.
              </p>
            </CardContent>
          </Card>

          {/* Card 2 */}
          <Card className="hover:border-foreground/30 transition-all duration-300">
            <CardHeader className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground">
                <Calendar className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Holiday & Cut-Off Aware</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Accurately models dynamic T+N settlement cycles, daily acquirer cut-off windows, and regional bank holidays across 80+ worldwide clearing networks.
              </p>
            </CardContent>
          </Card>

          {/* Card 3 */}
          <Card className="hover:border-foreground/30 transition-all duration-300">
            <CardHeader className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground">
                <Database className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Developer-Owned Ledgers</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Calculation engines run 100% locally in your Node.js or browser environment. Zero telemetry, zero external dependencies, and zero raw cardholder data.
              </p>
            </CardContent>
          </Card>

          {/* Card 4 */}
          <Card className="hover:border-foreground/30 transition-all duration-300">
            <CardHeader className="space-y-3">
              <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Apache-2.0 Open Source</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Free and open-source SDKs for Core, Node.js, and React. Zero runtime dependencies in <code className="font-mono text-foreground">@trivio.ink/core</code> for total isolation.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 3. Interactive Settlement Intelligence Calculator */}
      <section className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center space-y-3 mb-12">
          <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold">
            Interactive Console
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Experience Divine Settlement Live
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Test the live deterministic calculation engine right here in your browser. Configure transaction gross, merchant discount rates, and settlement cycles.
          </p>
        </div>

        <SettlementCalculator />
      </section>

      {/* 4. The Three Trivio SDKs Architecture & Code Tabs */}
      <section className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="text-center space-y-3 mb-10">
          <Badge variant="outline" className="text-xs uppercase tracking-wider font-semibold">
            SDK Architecture
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Three Modular Packages, One Philosophy
          </h2>
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Designed to seamlessly integrate across backend services, frontend applications, and offline reconciliation batch jobs.
          </p>
        </div>

        <Tabs defaultValue="core" className="w-full">
          <div className="flex justify-center mb-6">
            <TabsList>
              <TabsTrigger value="core">@trivio.ink/core</TabsTrigger>
              <TabsTrigger value="node">@trivio.ink/node</TabsTrigger>
              <TabsTrigger value="react">@trivio.ink/react</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="core" className="space-y-4">
            <div className="text-xs text-muted-foreground text-center">
              Zero-dependency calculation engine. Runs in any modern JavaScript runtime (Node, Deno, Bun, Cloudflare Workers, Browsers).
            </div>
            <CodeBlock
              title="@trivio.ink/core — Pure Zero-Float Financial Calculation"
              language="typescript"
              code={coreCode}
            />
          </TabsContent>

          <TabsContent value="node" className="space-y-4">
            <div className="text-xs text-muted-foreground text-center">
              Configured client with JSON-safe ledger serialization, batch calculation helpers, and database adapters.
            </div>
            <CodeBlock
              title="@trivio.ink/node — Server-Side Settlement Client"
              language="typescript"
              code={nodeCode}
            />
          </TabsContent>

          <TabsContent value="react" className="space-y-4">
            <div className="text-xs text-muted-foreground text-center">
              Accessible, theme-aware React components for merchant portals, payment checkout summaries, and reconciliation dashboards.
            </div>
            <CodeBlock
              title="@trivio.ink/react — UI Components for Fee Summaries"
              language="tsx"
              code={reactCode}
            />
          </TabsContent>
        </Tabs>
      </section>

      {/* 5. Closing Heavenly Call-To-Action */}
      <section className="container mx-auto px-4 sm:px-6 max-w-4xl">
        <div className="rounded-3xl border border-border bg-card/60 backdrop-blur-2xl p-8 sm:p-14 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="celestial-halo" />
          
          <Badge variant="heaven" className="text-xs">
            Begin with Trivio Today
          </Badge>

          <h2 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground max-w-2xl mx-auto leading-tight">
            Ascend Beyond Financial Purgatory.
          </h2>

          <p className="text-sm sm:text-base text-muted-foreground max-w-lg mx-auto leading-relaxed">
            Eliminate reconciliation bugs, penny rounding discrepancies, and holiday settlement delays with deterministic code.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button asChild size="lg" className="w-full sm:w-auto gap-2 shadow-lg">
              <a
                href="https://docs.trivio.ink"
                target="_blank"
                rel="noopener noreferrer"
              >
                Read Official Documentation
                <ArrowRight className="w-4 h-4" />
              </a>
            </Button>
            <Button asChild size="lg" variant="outline" className="w-full sm:w-auto gap-2">
              <a
                href="https://github.com/trivio-ink/trivio-platform"
                target="_blank"
                rel="noopener noreferrer"
              >
                View on GitHub
                <ExternalLink className="w-4 h-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
