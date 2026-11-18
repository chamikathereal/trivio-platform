"use client";

import React, { useState } from "react";
import {
  Copy,
  Check,
  ExternalLink,
  Terminal,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CODE_EXAMPLES = {
  core: `import { calculatePaymentSettlementEstimate } from "@trivio.ink/core";

// Deterministic settlement estimate (Zero float, 100% offline)
const estimate = calculatePaymentSettlementEstimate({
  grossMinor: 1000000, // $10,000.00 in minor currency units (cents)
  currency: "USD",
  transactionTime: "2026-11-20T17:30:00Z",
  acquirerId: "ACQ_DEMO",
}, {
  feeRules: [{
    id: "RULE_MDR",
    version: "1.0.0",
    acquirerId: "ACQ_DEMO",
    effectiveFrom: "2026-01-01T00:00:00Z",
    priority: 0,
    feeStructure: {
      rateBasisPoints: 220, // 2.20% MDR
      fixedFeeMinor: 30,    // $0.30 fixed fee
    },
    rateSource: "merchant_configured",
  }],
  settlementPolicies: [{
    id: "POLICY_T2",
    version: "1.0.0",
    acquirerId: "ACQ_DEMO",
    effectiveFrom: "2026-01-01",
    priority: 0,
    cycleLength: 2,
    cycleUnit: "business_days",
    cutOffTime: "16:00",
    timeZone: "America/New_York",
    calendarId: "CAL_US",
    nonWorkingDayConvention: "NEXT_BUSINESS_DAY",
  }],
  calendars: [{
    id: "CAL_US",
    version: "1.0.0",
    timeZone: "America/New_York",
    workingDays: [1, 2, 3, 4, 5],
    holidays: ["2026-12-25", "2027-01-01"],
  }]
});

console.log(estimate.netMinor); 
// 977970 -> Exactly $9,779.70 net payout without floating-point penny drift
console.log(estimate.expectedSettlementDate); 
// "2026-11-24" -> Shifted past weekend to Tuesday clearance`,

  node: `import { TrivioClient } from "@trivio.ink/node";

// Initialize server-side client instance across microservices cluster
const client = new TrivioClient({
  defaultFeeRule: {
    id: "RULE_ENTERPRISE_MDR",
    version: "1.0.0",
    acquirerId: "ACQ_ENTERPRISE",
    effectiveFrom: "2026-01-01T00:00:00Z",
    priority: 0,
    feeStructure: {
      rateBasisPoints: 220,
      fixedFeeMinor: 30,
    },
    rateSource: "merchant_configured",
  },
  defaultSettlementPolicy: {
    id: "POLICY_T_PLUS_2",
    version: "1.0.0",
    acquirerId: "ACQ_ENTERPRISE",
    effectiveFrom: "2026-01-01",
    priority: 0,
    cycleLength: 2,
    cycleUnit: "business_days",
    cutOffTime: "16:00",
    timeZone: "America/New_York",
    calendarId: "CAL_US",
    nonWorkingDayConvention: "NEXT_BUSINESS_DAY",
  },
  defaultCalendar: {
    id: "CAL_US",
    version: "1.0.0",
    timeZone: "America/New_York",
    workingDays: [1, 2, 3, 4, 5],
    holidays: ["2026-12-25"],
  },
});

// Safe JSON serialization with automatic BigInt conversion
const snapshot = client.createSettlementSnapshot({
  grossMinor: 1000000,
  currency: "USD",
  transactionTime: new Date().toISOString(),
  acquirerId: "ACQ_ENTERPRISE",
});

// Safe for database persistence and JSON.stringify without TypeError
const jsonString = JSON.stringify(snapshot);`,

  react: `import React from "react";
import { 
  TrivioSettlementSummary, 
  TrivioFeeBreakdown 
} from "@trivio.ink/react";

export function PayoutDetails({ estimate }) {
  return (
    <div className="space-y-4">
      {/* High-level settlement card */}
      <TrivioSettlementSummary 
        estimate={estimate} 
        currency="USD" 
        variant="minimal" 
      />

      {/* Detailed deduction ledger */}
      <TrivioFeeBreakdown 
        estimate={estimate} 
        showBasisPoints={true} 
      />
    </div>
  );
}`,
};

export default function IntegrationsPage() {
  const [activeTab, setActiveTab] = useState<"core" | "node" | "react">("core");
  const [copied, setCopied] = useState(false);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Developer Integration & SDK Tooling
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Embed Trivio deterministic primitives into developer infrastructure, background workers, and web portals.
          </p>
        </div>

        <Button asChild size="sm" variant="outline" className="gap-1.5 shadow-sm text-xs">
          <a href="https://docs.trivio.ink" target="_blank" rel="noopener noreferrer">
            <span>Documentation Portal</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </Button>
      </div>

      {/* Package Quick Install Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="hover:border-foreground/30 transition-colors">
          <CardHeader className="pb-2 space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold text-foreground">
                @trivio.ink/core
              </CardTitle>
              <Badge variant="outline" className="text-[9px]">v0.1.0 Live</Badge>
            </div>
            <CardDescription className="text-[11px]">
              Pure isolated zero-dependency calculation primitives.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="p-2 rounded-md bg-secondary/50 border border-border/60 flex items-center justify-between text-[11px] font-mono">
              <span className="text-foreground truncate">npm install @trivio.ink/core</span>
              <button
                type="button"
                onClick={() => handleCopy("npm install @trivio.ink/core")}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Copy command"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-foreground/30 transition-colors">
          <CardHeader className="pb-2 space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold text-foreground">
                @trivio.ink/node
              </CardTitle>
              <Badge variant="outline" className="text-[9px]">v0.1.0 Live</Badge>
            </div>
            <CardDescription className="text-[11px]">
              Server-side client and BigInt-safe ledger snapshots.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="p-2 rounded-md bg-secondary/50 border border-border/60 flex items-center justify-between text-[11px] font-mono">
              <span className="text-foreground truncate">npm install @trivio.ink/node</span>
              <button
                type="button"
                onClick={() => handleCopy("npm install @trivio.ink/node")}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Copy command"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </CardContent>
        </Card>

        <Card className="hover:border-foreground/30 transition-colors">
          <CardHeader className="pb-2 space-y-1">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xs font-mono font-bold text-foreground">
                @trivio.ink/react
              </CardTitle>
              <Badge variant="outline" className="text-[9px]">v0.1.0 Live</Badge>
            </div>
            <CardDescription className="text-[11px]">
              Pre-built UI settlement cards and ledger components.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="p-2 rounded-md bg-secondary/50 border border-border/60 flex items-center justify-between text-[11px] font-mono">
              <span className="text-foreground truncate">npm install @trivio.ink/react</span>
              <button
                type="button"
                onClick={() => handleCopy("npm install @trivio.ink/react")}
                className="p-1 text-muted-foreground hover:text-foreground cursor-pointer"
                aria-label="Copy command"
              >
                <Copy className="w-3 h-3" />
              </button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Code Snippets Section */}
      <Card>
        <CardHeader className="border-b border-border/60 pb-3 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-foreground" />
            <CardTitle className="text-sm font-semibold">
              Integration Code Recipes
            </CardTitle>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-0.5 rounded-md bg-secondary border border-border/60 text-xs font-mono">
              <button
                type="button"
                onClick={() => setActiveTab("core")}
                className={`px-2.5 py-1 rounded-sm transition-colors cursor-pointer ${
                  activeTab === "core" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                @trivio.ink/core
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("node")}
                className={`px-2.5 py-1 rounded-sm transition-colors cursor-pointer ${
                  activeTab === "node" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                @trivio.ink/node
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("react")}
                className={`px-2.5 py-1 rounded-sm transition-colors cursor-pointer ${
                  activeTab === "react" ? "bg-background text-foreground font-semibold shadow-xs" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                @trivio.ink/react
              </button>
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => handleCopy(CODE_EXAMPLES[activeTab])}
              className="h-7 text-xs gap-1"
            >
              {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
              <span>{copied ? "Copied" : "Copy Code"}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <pre className="p-4 sm:p-5 text-xs font-mono bg-black text-zinc-200 overflow-x-auto terminal-scroll leading-relaxed rounded-b-lg">
            <code>{CODE_EXAMPLES[activeTab]}</code>
          </pre>
        </CardContent>
      </Card>

      {/* Stage 4C Cloud API Preview (Clearly labeled as Planned) */}
      <Card className="border-border/60 bg-secondary/10">
        <CardHeader className="border-b border-border/60 pb-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                <span>Hosted Cloud Endpoints (Roadmap Preview)</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Future managed multi-tenant API capabilities planned for Stage 4C (NestJS + PostgreSQL).
              </CardDescription>
            </div>
            <Badge variant="outline" className="text-[9px] font-mono">
              Planned Stage 4C
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-3 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border border-border/70 bg-background/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-foreground">POST /v1/settlements/estimate</span>
                <span className="text-[9px] font-mono text-muted-foreground">HTTP API</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Cloud REST microservice proxy for remote ledger reconciliation without maintaining local calendar shifts.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border/70 bg-background/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-foreground">GET /v1/merchants/:id/policies</span>
                <span className="text-[9px] font-mono text-muted-foreground">HTTP API</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Fetch published merchant fee agreement versions and calendar schedules from managed cloud database.
              </p>
            </div>

            <div className="p-3 rounded-lg border border-border/70 bg-background/50 space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-mono text-[10px] font-bold text-foreground">POST /v1/reconciliation/batch</span>
                <span className="text-[9px] font-mono text-muted-foreground">HTTP API</span>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Asynchronous batch settlement discrepancy detection comparing bank credit statements against local ledgers.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
