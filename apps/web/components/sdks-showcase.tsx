"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";
import {
  Check,
  Copy,
  ExternalLink,
  Layers,
  Server,
  Layout,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Database,
  Calendar,
  DollarSign,
  Sparkles,
  Lock,
} from "lucide-react";

const coreCode = `import { 
  calculatePaymentSettlementEstimate, 
  estimateSettlementDate 
} from "@trivio.ink/core";

// 1. Calculate settlement estimate with MDR & fixed fee
const estimate = calculatePaymentSettlementEstimate({
  grossMinor: 500000n, // $5,000.00 in minor units (zero float drift)
  feeRule: {
    percentageBps: 220, // 2.20% Merchant Discount Rate
    fixedFeeMinor: 30n,  // $0.30 fixed acquirer levy
  },
  settlementPolicy: {
    cycleDays: 2,       // T+2 clearance cycle
    cutOffTimeUtc: "16:00",
    weekendHandling: "NEXT_BUSINESS_DAY",
  },
  transactionTimeUtc: "2026-11-16T17:30:00Z", // Past cut-off
});

console.log(estimate.netMinor);           // 488970n ($4,889.70)
console.log(estimate.totalFeeMinor);      // 11030n ($110.30)
console.log(estimate.expectedSettlementDate); // "2026-11-19"`;

const nodeCode = `import { TrivioClient } from "@trivio.ink/node";

// 1. Server-side client holding configurable merchant fee schedules
const client = new TrivioClient({
  defaultFeeRule: {
    id: "RULE_ENTERPRISE_MDR",
    percentageBps: 290, // 2.90%
    fixedFeeMinor: 30n,  // $0.30
  },
  defaultSettlementPolicy: {
    id: "POLICY_T_PLUS_1",
    cycleDays: 1,
    cutOffTimeUtc: "16:00",
    weekendHandling: "NEXT_BUSINESS_DAY",
    holidays: ["2026-12-25", "2027-01-01"],
  },
});

// 2. Generate BigInt-safe serializable snapshot for ledger storage
const record = client.createLedgerRecord({
  transactionId: "txn_987654321",
  grossMinor: 100000n,
  transactionTimeUtc: new Date().toISOString(),
});

// Safe for JSON.stringify without BigInt TypeError
const jsonString = JSON.stringify(record);`;

const reactCode = `import React from "react";
import { 
  TrivioSettlementSummary, 
  TrivioFeeBreakdown 
} from "@trivio.ink/react";

export function PayoutDetails({ estimate }) {
  return (
    <div className="space-y-4">
      {/* 1. High-level gross, fees, and net settlement summary */}
      <TrivioSettlementSummary 
        estimate={estimate} 
        currency="USD" 
      />
      
      {/* 2. Itemized fee table with MDR and acquirer breakdown */}
      <TrivioFeeBreakdown 
        grossMinor={estimate.grossMinor}
        percentageBps={250}
        fixedFeeMinor={1500n}
        currency="USD"
      />
    </div>
  );
}`;

interface InstallPillProps {
  command: string;
}

function InstallPill({ command }: InstallPillProps) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(command);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <button
      onClick={copy}
      className="group flex items-center justify-between gap-3 px-3.5 py-2 rounded-xl border border-border/80 bg-background/80 hover:bg-secondary/60 hover:border-foreground/30 transition-all font-mono text-xs text-foreground select-none w-full sm:w-auto"
      title="Click to copy install command"
    >
      <div className="flex items-center gap-2 truncate">
        <span className="text-muted-foreground/60 select-none">$</span>
        <span className="truncate">{command}</span>
      </div>
      <div className="flex items-center gap-1.5 flex-shrink-0 text-[11px] text-muted-foreground group-hover:text-foreground">
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-500" />
            <span className="text-emerald-500 font-semibold">Copied</span>
          </>
        ) : (
          <>
            <Copy className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100 transition-opacity" />
            <span className="hidden sm:inline">Copy</span>
          </>
        )}
      </div>
    </button>
  );
}

export function SDKsShowcase() {
  const [activeTab, setActiveTab] = useState<"all" | "core" | "node" | "react">("all");

  return (
    <div className="relative min-h-screen pt-28 pb-24 overflow-hidden">
      {/* 1. Subtle Celestial Ambient Halo */}
      <div className="celestial-beam opacity-70 pointer-events-none" />
      <div className="celestial-halo pointer-events-none" />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 max-w-6xl space-y-20">
        {/* 2. Hero Header */}
        <div className="text-center space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-background/80 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-foreground" />
            <span className="text-xs font-mono font-medium text-foreground tracking-wide uppercase">
              Angelic Primitives · Monorepo SDK Suite
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground leading-[1.1]">
            Three Decoupled Engines.{" "}
            <span className="font-serif italic font-normal text-muted-foreground">
              Zero Float Math.
            </span>
          </h1>

          <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">
            Trivio models payment discount rates, acquirer fees, and calendar shifts with strict
            deterministic precision. Designed to execute strictly inside developer infrastructure
            with zero cloud telemetry and zero external dependencies.
          </p>

          {/* Quick Package Filter Switcher */}
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setActiveTab("all")}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                activeTab === "all"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              All Packages (3)
            </button>
            <button
              onClick={() => setActiveTab("core")}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                activeTab === "core"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              @trivio.ink/core
            </button>
            <button
              onClick={() => setActiveTab("node")}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                activeTab === "node"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              @trivio.ink/node
            </button>
            <button
              onClick={() => setActiveTab("react")}
              className={`px-4 py-1.5 rounded-full text-xs font-mono font-medium transition-all ${
                activeTab === "react"
                  ? "bg-foreground text-background shadow-md"
                  : "bg-secondary/60 text-muted-foreground hover:text-foreground border border-border/60"
              }`}
            >
              @trivio.ink/react
            </button>
          </div>
        </div>

        {/* 3. Package 1: @trivio.ink/core */}
        {(activeTab === "all" || activeTab === "core") && (
          <section id="core" className="scroll-mt-28">
            <div className="glass-card rounded-3xl border border-border/80 bg-card/60 backdrop-blur-2xl p-6 sm:p-10 space-y-8 transition-all hover:border-foreground/30 hover:shadow-2xl">
              {/* Header Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/80 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl border border-border bg-foreground/5 flex items-center justify-center flex-shrink-0">
                    <Layers className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                        @trivio.ink/core
                      </h2>
                      <Badge variant="default" className="text-[10px] font-mono tracking-wider">
                        v0.1.0 Live
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded-md border border-border/60 bg-secondary/50">
                        Zero Dependencies
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
                      The mathematical heart. Zero-dependency calculation primitives, minor currency
                      units, and holiday-aware settlement calendar forecasting.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://www.npmjs.com/package/@trivio.ink/core"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-foreground font-mono hover:underline px-3 py-1.5 rounded-lg border border-border bg-secondary/40"
                  >
                    npm package <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Body: Left Specs & Right Terminal */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      Architectural Invariants
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl border border-border/80 bg-background/50 space-y-1">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Zero-Float Integer Math</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                          Strict integer minor currency units with BigInt precision. Eliminates
                          IEEE-754 penny drift and rounding errors.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl border border-border/80 bg-background/50 space-y-1">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                          <ShieldCheck className="w-4 h-4 text-emerald-500" />
                          <span>Zero Runtime Dependencies</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                          100% isolated pure mathematics. Zero supply-chain attack surface and zero
                          external libraries permitted.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl border border-border/80 bg-background/50 space-y-1">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                          <Calendar className="w-4 h-4 text-emerald-500" />
                          <span>Configurable Calendar Shift</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                          Forecasts T+1 to T+30 cycles, daily bank cut-off windows, and shifts past
                          weekends and jurisdictional public holidays.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Install via npm:
                    </span>
                    <InstallPill command="npm install @trivio.ink/core" />
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <CodeBlock
                    title="@trivio.ink/core — Pure Deterministic Math"
                    code={coreCode}
                    language="typescript"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 4. Package 2: @trivio.ink/node */}
        {(activeTab === "all" || activeTab === "node") && (
          <section id="node" className="scroll-mt-28">
            <div className="glass-card rounded-3xl border border-border/80 bg-card/60 backdrop-blur-2xl p-6 sm:p-10 space-y-8 transition-all hover:border-foreground/30 hover:shadow-2xl">
              {/* Header Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/80 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl border border-border bg-foreground/5 flex items-center justify-center flex-shrink-0">
                    <Server className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                        @trivio.ink/node
                      </h2>
                      <Badge variant="default" className="text-[10px] font-mono tracking-wider">
                        v0.1.0 Live
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded-md border border-border/60 bg-secondary/50">
                        Node.js 18+
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
                      Server-side settlement client foundation for Node.js microservices, backend
                      workers, and financial ledger persistence.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://www.npmjs.com/package/@trivio.ink/node"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-foreground font-mono hover:underline px-3 py-1.5 rounded-lg border border-border bg-secondary/40"
                  >
                    npm package <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Body: Left Specs & Right Terminal */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      Architectural Invariants
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl border border-border/80 bg-background/50 space-y-1">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Configurable TrivioClient</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                          Reusable client instance encapsulates merchant fee schedules, acquirer
                          rules, cut-offs, and holiday calendars across your cluster.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl border border-border/80 bg-background/50 space-y-1">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                          <Database className="w-4 h-4 text-emerald-500" />
                          <span>Crash-Free JSON Snapshots</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                          Automatic string conversion for BigInt fields guarantees zero runtime
                          exceptions during JSON.stringify and database persistence.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl border border-border/80 bg-background/50 space-y-1">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                          <Lock className="w-4 h-4 text-emerald-500" />
                          <span>Framework-Decoupled</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                          Operates cleanly in Express, Fastify, NestJS, or serverless lambda
                          functions with zero vendor lock-in.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Install via npm:
                    </span>
                    <InstallPill command="npm install @trivio.ink/node" />
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <CodeBlock
                    title="@trivio.ink/node — Backend Ledger Client"
                    code={nodeCode}
                    language="typescript"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 5. Package 3: @trivio.ink/react */}
        {(activeTab === "all" || activeTab === "react") && (
          <section id="react" className="scroll-mt-28">
            <div className="glass-card rounded-3xl border border-border/80 bg-card/60 backdrop-blur-2xl p-6 sm:p-10 space-y-8 transition-all hover:border-foreground/30 hover:shadow-2xl">
              {/* Header Bar */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border/80 pb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl border border-border bg-foreground/5 flex items-center justify-center flex-shrink-0">
                    <Layout className="w-6 h-6 text-foreground" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2.5">
                      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground font-mono">
                        @trivio.ink/react
                      </h2>
                      <Badge variant="default" className="text-[10px] font-mono tracking-wider">
                        v0.1.0 Live
                      </Badge>
                      <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded-md border border-border/60 bg-secondary/50">
                        React 18+ / 19
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1.5 max-w-xl">
                      Accessible React UI components, currency exponent safety, and merchant payout
                      presentation primitives.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <a
                    href="https://www.npmjs.com/package/@trivio.ink/react"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-foreground font-mono hover:underline px-3 py-1.5 rounded-lg border border-border bg-secondary/40"
                  >
                    npm package <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>

              {/* Body: Left Specs & Right Terminal */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                <div className="lg:col-span-5 space-y-6">
                  <div className="space-y-3">
                    <h3 className="text-xs font-mono uppercase tracking-wider text-muted-foreground font-semibold">
                      Architectural Invariants
                    </h3>
                    <div className="space-y-3">
                      <div className="p-3.5 rounded-2xl border border-border/80 bg-background/50 space-y-1">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          <span>Currency Exponent Safety</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                          Accurately formats 0-decimal (JPY), 2-decimal (USD, EUR, GBP), and
                          3-decimal (BHD, KWD) minor currency units without loss.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl border border-border/80 bg-background/50 space-y-1">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                          <DollarSign className="w-4 h-4 text-emerald-500" />
                          <span>Production-Ready UI Cards</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                          Pre-built settlement payout summary cards, fee breakdown trees, and clearance
                          timeline pills.
                        </p>
                      </div>

                      <div className="p-3.5 rounded-2xl border border-border/80 bg-background/50 space-y-1">
                        <div className="flex items-center gap-2 text-foreground font-semibold text-xs">
                          <Sparkles className="w-4 h-4 text-emerald-500" />
                          <span>Pure Monochrome Adaptation</span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed pl-6">
                          Engineered with CSS custom properties to seamlessly adapt to pure Black
                          and White themes without cosmetic conflicts.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-[11px] font-mono text-muted-foreground">
                      Install via npm:
                    </span>
                    <InstallPill command="npm install @trivio.ink/react" />
                  </div>
                </div>

                <div className="lg:col-span-7">
                  <CodeBlock
                    title="@trivio.ink/react — UI Payout Breakdown"
                    code={reactCode}
                    language="typescript"
                  />
                </div>
              </div>
            </div>
          </section>
        )}

        {/* 6. System Architecture Data-Flow Visual */}
        <section className="glass-card rounded-3xl border border-border/80 bg-card/60 backdrop-blur-2xl p-6 sm:p-10 space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-2">
            <Badge variant="outline" className="font-mono text-[10px] tracking-wider uppercase">
              Decoupled Data Flow
            </Badge>
            <h3 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
              How the 3 Engines Work Together
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Every layer executes inside developer-owned infrastructure with zero cloud telemetry.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
            {/* Stage 1: Ingest & Orchestration */}
            <div className="p-6 rounded-2xl border border-border/80 bg-background/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-muted-foreground tracking-wider uppercase">
                  Stage 01
                </span>
                <Server className="w-5 h-5 text-foreground" />
              </div>
              <h4 className="text-base font-bold text-foreground">@trivio.ink/node</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Captures gross transactions from webhooks, applies merchant fee policies, adjusts for
                bank holidays, and manages cluster configuration.
              </p>
              <div className="pt-2 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
                Output: Sanitized Transaction Payload
              </div>
            </div>

            {/* Stage 2: Pure Core Engine */}
            <div className="p-6 rounded-2xl border border-foreground/30 bg-background/80 shadow-lg space-y-4 relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-foreground text-background font-mono text-[10px] font-bold tracking-wider uppercase shadow-sm">
                Pure Core Heart
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-muted-foreground tracking-wider uppercase">
                  Stage 02
                </span>
                <Layers className="w-5 h-5 text-foreground" />
              </div>
              <h4 className="text-base font-bold text-foreground">@trivio.ink/core</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Executes zero-float integer math in minor units, computes deterministic MDR with
                Round-Half-Up, and calculates calendar clearance dates.
              </p>
              <div className="pt-2 border-t border-border/60 text-[11px] font-mono text-foreground font-semibold">
                Guaranteed: Zero Penny Drift
              </div>
            </div>

            {/* Stage 3: Reactive UI Presentation */}
            <div className="p-6 rounded-2xl border border-border/80 bg-background/50 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono font-bold text-muted-foreground tracking-wider uppercase">
                  Stage 03
                </span>
                <Layout className="w-5 h-5 text-foreground" />
              </div>
              <h4 className="text-base font-bold text-foreground">@trivio.ink/react</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Renders accessible payout summaries and fee breakdowns in merchant dashboards with
                currency exponent safety and pure monochrome styling.
              </p>
              <div className="pt-2 border-t border-border/60 text-[11px] font-mono text-muted-foreground">
                Output: Merchant Payout UI
              </div>
            </div>
          </div>
        </section>

        {/* 7. Comprehensive Capability Comparison Matrix */}
        <section className="glass-card rounded-3xl border border-border/80 bg-card/60 backdrop-blur-2xl p-6 sm:p-10 space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-extrabold tracking-tight text-foreground font-mono">
              Engine Capability Matrix
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Technical specifications and operational guarantees across all three Trivio packages.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs border-collapse">
              <thead>
                <tr className="border-b border-border/80 text-muted-foreground">
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider text-[11px]">Feature / Invariant</th>
                  <th className="py-3 px-4 font-semibold text-foreground text-[11px]">@trivio.ink/core</th>
                  <th className="py-3 px-4 font-semibold text-foreground text-[11px]">@trivio.ink/node</th>
                  <th className="py-3 px-4 font-semibold text-foreground text-[11px]">@trivio.ink/react</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 text-muted-foreground">
                <tr className="hover:bg-foreground/[0.02]">
                  <td className="py-3.5 px-4 font-sans font-medium text-foreground">Runtime Target</td>
                  <td className="py-3.5 px-4">Universal JS/TS (Browser, Node, Deno, Bun, Edge)</td>
                  <td className="py-3.5 px-4">Node.js 18+, Serverless, Fastify, Express, NestJS</td>
                  <td className="py-3.5 px-4">React 18+, Next.js (Client Components)</td>
                </tr>
                <tr className="hover:bg-foreground/[0.02]">
                  <td className="py-3.5 px-4 font-sans font-medium text-foreground">Runtime Dependencies</td>
                  <td className="py-3.5 px-4 text-foreground font-bold">0 (Zero Dependencies)</td>
                  <td className="py-3.5 px-4">Minimal (Core only)</td>
                  <td className="py-3.5 px-4">Minimal (Core + React)</td>
                </tr>
                <tr className="hover:bg-foreground/[0.02]">
                  <td className="py-3.5 px-4 font-sans font-medium text-foreground">Financial Math Policy</td>
                  <td className="py-3.5 px-4 text-emerald-500 font-semibold">Zero-Float (Minor Units)</td>
                  <td className="py-3.5 px-4 text-emerald-500 font-semibold">Zero-Float (Minor Units)</td>
                  <td className="py-3.5 px-4 text-emerald-500 font-semibold">Zero-Float Display Formatter</td>
                </tr>
                <tr className="hover:bg-foreground/[0.02]">
                  <td className="py-3.5 px-4 font-sans font-medium text-foreground">BigInt Precision</td>
                  <td className="py-3.5 px-4 text-emerald-500 font-semibold">Native BigInt</td>
                  <td className="py-3.5 px-4 text-emerald-500 font-semibold">Native BigInt + Safe JSON</td>
                  <td className="py-3.5 px-4 text-emerald-500 font-semibold">Formatted from BigInt</td>
                </tr>
                <tr className="hover:bg-foreground/[0.02]">
                  <td className="py-3.5 px-4 font-sans font-medium text-foreground">Telemetry & Cloud Calls</td>
                  <td className="py-3.5 px-4 text-foreground font-bold">100% Offline (Zero Calls)</td>
                  <td className="py-3.5 px-4 text-foreground font-bold">100% Offline (Zero Calls)</td>
                  <td className="py-3.5 px-4 text-foreground font-bold">100% Offline (Zero Calls)</td>
                </tr>
                <tr className="hover:bg-foreground/[0.02]">
                  <td className="py-3.5 px-4 font-sans font-medium text-foreground">Settlement Calendar</td>
                  <td className="py-3.5 px-4">T+N, Cut-off & Holiday Shifter</td>
                  <td className="py-3.5 px-4">Batch Policy Engine</td>
                  <td className="py-3.5 px-4">Settlement Timeline Badge</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* 8. Full Monorepo Quick Install Bar */}
        <div className="glass-card rounded-3xl border border-border/80 bg-foreground/[0.02] p-8 sm:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl font-bold text-foreground">Ready to integrate Trivio?</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Install all three packages into your workspace with a single npm command.
            </p>
          </div>
          <div className="w-full md:w-auto">
            <InstallPill command="npm install @trivio.ink/core @trivio.ink/node @trivio.ink/react" />
          </div>
        </div>

        {/* 9. Next Navigation Links */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Link href="/calculator">
            <Button size="lg" className="rounded-full px-6 gap-2">
              <span>Test in Interactive Calculator</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
          <Link href="/about">
            <Button variant="outline" size="lg" className="rounded-full px-6">
              Read Our Mission & Manifesto
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
