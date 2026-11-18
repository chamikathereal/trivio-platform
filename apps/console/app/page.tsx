"use client";

import React from "react";
import Link from "next/link";
import { useWorkspace } from "@/components/workspace-context";
import { formatMinorUnits, formatBps } from "@/lib/utils";
import {
  Building2,
  FileSpreadsheet,
  CalendarDays,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  const { merchants, feeAgreements, settlementPolicies, warnings, selectedMerchant } = useWorkspace();

  const activeFeeAgreement = feeAgreements.find((f) => f.id === selectedMerchant.feeAgreementId);
  const activeSettlementPolicy = settlementPolicies.find((p) => p.id === selectedMerchant.settlementPolicyId);

  // Calculate high-level stats
  const totalVolume = merchants.reduce(
    (acc, m) => (m.currency === "USD" ? acc + m.monthlyVolumeEstimateMinor : acc),
    0n
  );

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top Banner: Stage 4B Environment */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl border border-border/80 bg-secondary/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold tracking-tight text-foreground">
              Developer Console
            </h1>
            <Badge variant="outline" className="text-[10px] font-mono">
              Stage 4B
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground">
            Workspace: <strong className="text-foreground">{selectedMerchant.name}</strong> ({selectedMerchant.currency}) · Acquirer: {selectedMerchant.acquirerName}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button asChild size="sm" variant="default" className="gap-1.5 shadow-sm">
            <Link href="/simulation">
              <Sparkles className="w-3.5 h-3.5" />
              Run Settlement Simulation
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/merchants">
              Manage Merchants
            </Link>
          </Button>
        </div>
      </div>

      {/* 4 Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <Card className="hover:border-foreground/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Configured Merchants
            </CardTitle>
            <Building2 className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {merchants.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-foreground font-semibold">
                {merchants.filter((m) => m.status === "ACTIVE").length} active
              </span>{" "}
              across 4 clearing regions
            </p>
          </CardContent>
        </Card>

        {/* Metric 2 */}
        <Card className="hover:border-foreground/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Fee Agreements
            </CardTitle>
            <FileSpreadsheet className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {feeAgreements.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-foreground font-semibold">
                Avg MDR {formatBps(Math.round(feeAgreements.reduce((acc, f) => acc + f.percentageBps, 0) / feeAgreements.length))}
              </span>{" "}
              blended rate
            </p>
          </CardContent>
        </Card>

        {/* Metric 3 */}
        <Card className="hover:border-foreground/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Settlement Policies
            </CardTitle>
            <CalendarDays className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {settlementPolicies.length}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1">
              <span className="text-foreground font-semibold">T+1 & T+2</span> holiday-aware cycles
            </p>
          </CardContent>
        </Card>

        {/* Metric 4 */}
        <Card className="hover:border-foreground/30 transition-colors">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              Illustrative Monthly Volume
            </CardTitle>
            <TrendingUp className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono tracking-tight text-foreground">
              {formatMinorUnits(totalVolume, "USD")}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1">
              Deterministic integer minor units
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Grid: Active Workspace Summary & Warnings */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Merchant Workspace Detail Card */}
        <Card className="lg:col-span-2">
          <CardHeader className="border-b border-border/60 pb-3">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <span>Active Workspace: {selectedMerchant.name}</span>
                  <Badge variant={selectedMerchant.status === "ACTIVE" ? "success" : "outline"} className="text-[9px]">
                    {selectedMerchant.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="text-xs">
                  Assigned acquiring partner, MDR fee tier, and clearance calendar rules.
                </CardDescription>
              </div>
              <Button asChild size="sm" variant="outline" className="h-7 text-xs">
                <Link href="/merchants">Switch</Link>
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-4 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Acquirer Box */}
              <div className="p-3 rounded-lg border border-border/70 bg-secondary/20 space-y-1">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Acquirer Integration</span>
                <p className="text-xs font-semibold text-foreground">{selectedMerchant.acquirerName}</p>
                <p className="text-[10px] text-muted-foreground font-mono">ID: {selectedMerchant.acquirerId}</p>
              </div>

              {/* Fee Agreement Box */}
              <div className="p-3 rounded-lg border border-border/70 bg-secondary/20 space-y-1">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Assigned Fee Schedule</span>
                <p className="text-xs font-semibold text-foreground truncate">
                  {activeFeeAgreement ? activeFeeAgreement.name : "Unassigned"}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  {activeFeeAgreement ? `${formatBps(activeFeeAgreement.percentageBps)} + ${formatMinorUnits(activeFeeAgreement.fixedFeeMinor, activeFeeAgreement.currency)}` : "—"}
                </p>
              </div>

              {/* Settlement Cycle Box */}
              <div className="p-3 rounded-lg border border-border/70 bg-secondary/20 space-y-1">
                <span className="text-[10px] uppercase font-mono text-muted-foreground">Clearance Policy</span>
                <p className="text-xs font-semibold text-foreground truncate">
                  {activeSettlementPolicy ? `T+${activeSettlementPolicy.cycleDays} Business Days` : "—"}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono">
                  Cut-off: {activeSettlementPolicy?.cutOffTimeUtc} UTC
                </p>
              </div>
            </div>

            {/* Quick Simulation Link */}
            <div className="flex items-center justify-between p-3 rounded-lg border border-border/70 bg-background/50">
              <div className="space-y-0.5">
                <p className="text-xs font-medium text-foreground">Verify Payout for {selectedMerchant.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  Simulate local ledger net deduction against {selectedMerchant.acquirerName} fee contracts.
                </p>
              </div>
              <Button asChild size="sm" variant="default" className="gap-1 h-7 text-xs">
                <Link href={`/simulation?merchant=${selectedMerchant.id}`}>
                  <span>Simulate</span>
                  <ArrowUpRight className="w-3 h-3" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Configuration Warnings & Operational Health */}
        <Card className="flex flex-col justify-between">
          <CardHeader className="border-b border-border/60 pb-3">
            <CardTitle className="text-sm font-semibold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-foreground" />
                <span>Configuration Warnings</span>
              </span>
              <Badge variant="outline" className="text-[9px]">
                {warnings.length} Active
              </Badge>
            </CardTitle>
            <CardDescription className="text-xs">
              Automated validation checks across merchant rate contracts.
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-3 space-y-2.5 flex-1 overflow-y-auto max-h-72 terminal-scroll">
            {warnings.map((warn) => (
              <div
                key={warn.id}
                className="p-2.5 rounded-lg border border-border/70 bg-secondary/15 space-y-1 text-left"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold text-foreground truncate">
                    {warn.title}
                  </span>
                  <Badge
                    variant={warn.severity === "high" ? "destructive" : "outline"}
                    className="text-[8px] px-1 py-0"
                  >
                    {warn.severity}
                  </Badge>
                </div>
                <p className="text-[10px] text-muted-foreground leading-normal">
                  {warn.message}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Illustrative Recent Settlement Ledger Activity */}
      <Card>
        <CardHeader className="border-b border-border/60 pb-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <CardTitle className="text-sm font-semibold">
              Illustrative Settlement Audit Log
            </CardTitle>
            <CardDescription className="text-xs">
              Deterministic calculations processed locally via <code>@trivio.ink/core</code> (Zero cloud telemetry).
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="outline" className="h-7 text-xs gap-1">
            <Link href="/simulation">
              <span>Open Simulator</span>
              <ArrowUpRight className="w-3 h-3" />
            </Link>
          </Button>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-secondary/40 text-muted-foreground font-mono text-[10px] uppercase border-b border-border/60">
              <tr>
                <th className="py-2.5 px-4 font-semibold">Transaction ID</th>
                <th className="py-2.5 px-4 font-semibold">Merchant</th>
                <th className="py-2.5 px-4 font-semibold">Gross Amount</th>
                <th className="py-2.5 px-4 font-semibold">Applied Fee</th>
                <th className="py-2.5 px-4 font-semibold">Net Payout</th>
                <th className="py-2.5 px-4 font-semibold">Settlement Date</th>
                <th className="py-2.5 px-4 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 font-mono">
              <tr className="hover:bg-secondary/20 transition-colors">
                <td className="py-2.5 px-4 font-medium text-foreground">txn_987654321</td>
                <td className="py-2.5 px-4 font-sans text-muted-foreground">Apex Cloud Services</td>
                <td className="py-2.5 px-4 font-semibold text-foreground">$10,000.00</td>
                <td className="py-2.5 px-4 text-muted-foreground">-$220.30 (2.20% + $0.30)</td>
                <td className="py-2.5 px-4 font-semibold text-foreground">$9,779.70</td>
                <td className="py-2.5 px-4 text-muted-foreground">2026-11-24 (T+2 Shift)</td>
                <td className="py-2.5 px-4">
                  <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium text-foreground">
                    <CheckCircle2 className="w-3 h-3" /> Reconciled
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-secondary/20 transition-colors">
                <td className="py-2.5 px-4 font-medium text-foreground">txn_485123990</td>
                <td className="py-2.5 px-4 font-sans text-muted-foreground">Lumina Telehealth</td>
                <td className="py-2.5 px-4 font-semibold text-foreground">$4,500.00</td>
                <td className="py-2.5 px-4 text-muted-foreground">-$130.65 (2.90% + $0.15)</td>
                <td className="py-2.5 px-4 font-semibold text-foreground">$4,369.35</td>
                <td className="py-2.5 px-4 text-muted-foreground">2026-11-19 (T+1)</td>
                <td className="py-2.5 px-4">
                  <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium text-foreground">
                    <CheckCircle2 className="w-3 h-3" /> Reconciled
                  </span>
                </td>
              </tr>
              <tr className="hover:bg-secondary/20 transition-colors">
                <td className="py-2.5 px-4 font-medium text-foreground">txn_123490812</td>
                <td className="py-2.5 px-4 font-sans text-muted-foreground">Serendib Voyages</td>
                <td className="py-2.5 px-4 font-semibold text-foreground">LKR 150,000.00</td>
                <td className="py-2.5 px-4 text-muted-foreground">-LKR 2,725.00 (1.80% + 25)</td>
                <td className="py-2.5 px-4 font-semibold text-foreground">LKR 147,275.00</td>
                <td className="py-2.5 px-4 text-muted-foreground">2026-11-20 (T+1)</td>
                <td className="py-2.5 px-4">
                  <span className="inline-flex items-center gap-1 text-[10px] font-sans font-medium text-foreground">
                    <Clock className="w-3 h-3" /> Pending Batch
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
