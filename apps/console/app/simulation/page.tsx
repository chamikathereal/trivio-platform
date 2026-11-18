"use client";

import React, { useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { useWorkspace } from "@/components/workspace-context";
import { formatMinorUnits, formatBps } from "@/lib/utils";
import {
  calculatePaymentSettlementEstimate,
  type IntegratedSettlementConfig,
  type IntegratedTransactionInput,
  type MerchantFeeRule,
  type SettlementCalendar,
  type SettlementPolicy,
} from "@trivio.ink/core";
import {
  Calculator,
  Calendar,
  Clock,
  Sparkles,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

export default function SimulationPage() {
  return (
    <React.Suspense
      fallback={
        <div className="p-12 text-center text-xs text-muted-foreground font-mono">
          Loading settlement simulation engine...
        </div>
      }
    >
      <SimulationContent />
    </React.Suspense>
  );
}

function SimulationContent() {
  const searchParams = useSearchParams();
  const merchantQueryId = searchParams.get("merchant");

  const { merchants, feeAgreements, settlementPolicies, selectedMerchantId, setSelectedMerchantId } = useWorkspace();

  // Active Merchant selection
  const initialMerchantId = merchantQueryId || selectedMerchantId;
  const [currentMerchantId, setCurrentMerchantId] = useState(initialMerchantId);

  const currentMerchant = useMemo(() => {
    return merchants.find((m) => m.id === currentMerchantId) || merchants[0] || {
      id: "mer_apex_cloud",
      name: "Apex Cloud Services Inc.",
      slug: "apex-cloud",
      status: "ACTIVE" as const,
      acquirerId: "acq_jpmorgan",
      acquirerName: "J.P. Morgan Payments",
      currency: "USD",
      feeAgreementId: "fee_ent_standard",
      settlementPolicyId: "pol_t_plus_2_us",
      monthlyVolumeEstimateMinor: 125000000n,
      createdAt: "2026-01-10",
      timezone: "America/New_York",
    };
  }, [merchants, currentMerchantId]);

  // Form Parameters
  const [grossInputDollars, setGrossInputDollars] = useState("10000"); // $10,000
  const [selectedFeeId, setSelectedFeeId] = useState(currentMerchant.feeAgreementId);
  const [selectedPolicyId, setSelectedPolicyId] = useState(currentMerchant.settlementPolicyId);
  const [transactionTimeUtc, setTransactionTimeUtc] = useState("2026-11-20T17:30:00Z");

  const feeAgreement = useMemo(() => {
    return feeAgreements.find((f) => f.id === selectedFeeId) || feeAgreements[0] || {
      id: "fee_ent_standard",
      name: "Enterprise Domestic MDR",
      version: "v2.1",
      status: "ACTIVE" as const,
      percentageBps: 220,
      fixedFeeMinor: 30n,
      priority: 10,
      effectiveFrom: "2026-01-01",
      description: "Standard domestic corporate acquiring rate.",
      currency: "USD",
    };
  }, [feeAgreements, selectedFeeId]);

  const settlementPolicy = useMemo(() => {
    return settlementPolicies.find((p) => p.id === selectedPolicyId) || settlementPolicies[0] || {
      id: "pol_t_plus_2_us",
      name: "US Federal Reserve T+2",
      version: "v2.0",
      status: "ACTIVE" as const,
      cycleDays: 2,
      cutOffTimeUtc: "16:00",
      weekendHandling: "following_business_day" as const,
      holidays: ["2026-12-25", "2027-01-01"],
      timezone: "America/New_York",
      description: "Standard clearance cycle.",
    };
  }, [settlementPolicies, selectedPolicyId]);

  // Execute Core Engine Deterministically via calculatePaymentSettlementEstimate
  const simulationResult = useMemo(() => {
    try {
      const grossMinor = Math.round(parseFloat(grossInputDollars || "0") * 100);
      const acquirerId = currentMerchant.acquirerId || "acq_default";
      const calendarId = `cal_${settlementPolicy.id}`;

      const input: IntegratedTransactionInput = {
        grossMinor,
        currency: feeAgreement.currency,
        transactionTime: transactionTimeUtc,
        acquirerId,
        merchantId: currentMerchant.id,
      };

      const feeRule: MerchantFeeRule = {
        id: feeAgreement.id,
        version: feeAgreement.version || "1.0.0",
        acquirerId,
        effectiveFrom: `${feeAgreement.effectiveFrom}T00:00:00Z`,
        priority: feeAgreement.priority || 0,
        feeStructure: {
          rateBasisPoints: feeAgreement.percentageBps,
          fixedFeeMinor: Number(feeAgreement.fixedFeeMinor),
          minFeeMinor: feeAgreement.minFeeMinor ? Number(feeAgreement.minFeeMinor) : undefined,
          maxFeeMinor: feeAgreement.maxFeeMinor ? Number(feeAgreement.maxFeeMinor) : undefined,
        },
        rateSource: "merchant_configured",
      };

      const policy: SettlementPolicy = {
        id: settlementPolicy.id,
        version: settlementPolicy.version || "1.0.0",
        acquirerId,
        effectiveFrom: "2026-01-01",
        priority: 0,
        cycleLength: settlementPolicy.cycleDays,
        cycleUnit: "business_days",
        cutOffTime: settlementPolicy.cutOffTimeUtc,
        timeZone: settlementPolicy.timezone || "America/New_York",
        calendarId,
        nonWorkingDayConvention: settlementPolicy.weekendHandling,
      };

      const calendar: SettlementCalendar = {
        id: calendarId,
        version: "1.0.0",
        timeZone: settlementPolicy.timezone || "America/New_York",
        workingDays: [1, 2, 3, 4, 5],
        holidays: settlementPolicy.holidays,
      };

      const config: IntegratedSettlementConfig = {
        feeRules: [feeRule],
        settlementPolicies: [policy],
        calendars: [calendar],
      };

      const result = calculatePaymentSettlementEstimate(input, config);

      return { success: true, data: result, error: null };
    } catch (err: any) {
      return { success: false, data: null, error: err.message || "Calculation failed" };
    }
  }, [grossInputDollars, currentMerchant, feeAgreement, settlementPolicy, transactionTimeUtc]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <span>Settlement Simulation Engine</span>
            <Badge variant="outline" className="text-[10px] font-mono">
              @trivio.ink/core
            </Badge>
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Execute local zero-float settlement calculations, holiday calendar shifts, and fee deduction ledgers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="success" className="text-[10px] py-1 px-2.5 font-mono">
            Deterministic Engine Active
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Form (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <Card>
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Calculator className="w-4 h-4" />
                <span>Simulation Parameters</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Select merchant profile or override fee rules and clearing cycle.
              </CardDescription>
            </CardHeader>

            <CardContent className="pt-4 space-y-4 text-xs">
              {/* Merchant preset selector */}
              <div className="space-y-1">
                <label className="font-medium text-foreground text-[11px]">
                  Preset Merchant Profile
                </label>
                <select
                  value={currentMerchantId}
                  onChange={(e) => {
                    const mId = e.target.value;
                    setCurrentMerchantId(mId);
                    setSelectedMerchantId(mId);
                    const m = merchants.find((item) => item.id === mId);
                    if (m) {
                      setSelectedFeeId(m.feeAgreementId);
                      setSelectedPolicyId(m.settlementPolicyId);
                    }
                  }}
                  className="w-full h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs focus:ring-1 focus:ring-ring font-medium"
                >
                  {merchants.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.currency} · {m.acquirerName})
                    </option>
                  ))}
                </select>
              </div>

              {/* Gross Amount Input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <label className="font-medium text-foreground">
                    Gross Transaction Amount ({feeAgreement.currency})
                  </label>
                  <span className="font-mono text-muted-foreground">
                    {Math.round(parseFloat(grossInputDollars || "0") * 100)} minor units
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-mono text-muted-foreground">$</span>
                  <Input
                    type="number"
                    value={grossInputDollars}
                    onChange={(e) => setGrossInputDollars(e.target.value)}
                    placeholder="10000"
                    className="pl-7 font-mono text-xs h-8 font-semibold"
                  />
                </div>
              </div>

              {/* Fee Agreement Selection */}
              <div className="space-y-1">
                <label className="font-medium text-foreground text-[11px]">
                  MDR Fee Agreement
                </label>
                <select
                  value={selectedFeeId}
                  onChange={(e) => setSelectedFeeId(e.target.value)}
                  className="w-full h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs focus:ring-1 focus:ring-ring font-mono"
                >
                  {feeAgreements.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} ({formatBps(f.percentageBps)} + {formatMinorUnits(f.fixedFeeMinor, f.currency)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Settlement Policy Selection */}
              <div className="space-y-1">
                <label className="font-medium text-foreground text-[11px]">
                  Settlement Calendar Policy
                </label>
                <select
                  value={selectedPolicyId}
                  onChange={(e) => setSelectedPolicyId(e.target.value)}
                  className="w-full h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs focus:ring-1 focus:ring-ring font-mono"
                >
                  {settlementPolicies.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (T+{p.cycleDays} · {p.cutOffTimeUtc} UTC)
                    </option>
                  ))}
                </select>
              </div>

              {/* Timestamp Input */}
              <div className="space-y-1">
                <div className="flex justify-between items-center text-[11px]">
                  <label className="font-medium text-foreground">
                    Transaction Capture Timestamp (UTC)
                  </label>
                  <button
                    type="button"
                    onClick={() => setTransactionTimeUtc(new Date().toISOString().replace(/\.\d{3}Z$/, "Z"))}
                    className="text-[10px] text-muted-foreground hover:text-foreground underline cursor-pointer"
                  >
                    Set Current UTC
                  </button>
                </div>
                <Input
                  value={transactionTimeUtc}
                  onChange={(e) => setTransactionTimeUtc(e.target.value)}
                  placeholder="2026-11-20T17:30:00Z"
                  className="font-mono text-xs h-8"
                />
                <p className="text-[10px] text-muted-foreground">
                  Policy cut-off window is {settlementPolicy.cutOffTimeUtc} UTC.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Deterministic Output & Ledger Breakdown (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          {simulationResult.success && simulationResult.data ? (
            <Card className="border-foreground/40 shadow-md">
              <CardHeader className="border-b border-border/60 pb-3">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <CardTitle className="text-sm font-semibold flex items-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Deterministic Payout Ledger</span>
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Zero-float BigInt calculation result with calendar holiday adjustment.
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono">
                    Exact Minor Units
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-5 text-xs">
                {/* 2 Primary Result Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Net Payout */}
                  <div className="p-4 rounded-xl border border-border/80 bg-secondary/30 space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase font-mono">
                      Net Payout to Merchant
                    </span>
                    <div className="text-2xl font-bold font-mono text-foreground">
                      {formatMinorUnits(simulationResult.data.netMinor, feeAgreement.currency)}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {simulationResult.data.netMinor} minor units
                    </span>
                  </div>

                  {/* Expected Settlement Date */}
                  <div className="p-4 rounded-xl border border-border/80 bg-secondary/30 space-y-1">
                    <span className="text-[11px] font-medium text-muted-foreground uppercase font-mono">
                      Expected Settlement Date
                    </span>
                    <div className="text-2xl font-bold font-mono text-foreground flex items-center gap-2">
                      <Calendar className="w-5 h-5" />
                      <span>{simulationResult.data.expectedSettlementDate}</span>
                    </div>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      {simulationResult.data.settlementCycle} clearance cycle
                    </span>
                  </div>
                </div>

                {/* Detailed Deduction Breakdown Table */}
                <div className="border border-border/70 rounded-lg overflow-hidden">
                  <table className="w-full text-xs font-mono">
                    <thead className="bg-secondary/40 text-[10px] text-muted-foreground uppercase border-b border-border/60">
                      <tr>
                        <th className="py-2 px-3 text-left">Calculation Component</th>
                        <th className="py-2 px-3 text-left">Applied Rate / Rule</th>
                        <th className="py-2 px-3 text-right">Deduction Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      <tr>
                        <td className="py-2 px-3 text-foreground font-medium">Gross Ingest</td>
                        <td className="py-2 px-3 text-muted-foreground">Original capture amount</td>
                        <td className="py-2 px-3 text-right text-foreground font-semibold">
                          {formatMinorUnits(simulationResult.data.grossMinor, feeAgreement.currency)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-foreground font-medium">Percentage MDR</td>
                        <td className="py-2 px-3 text-muted-foreground">
                          {formatBps(feeAgreement.percentageBps)} ({feeAgreement.percentageBps} bps)
                        </td>
                        <td className="py-2 px-3 text-right text-muted-foreground">
                          -{formatMinorUnits(simulationResult.data.percentageFeeMinor, feeAgreement.currency)}
                        </td>
                      </tr>
                      <tr>
                        <td className="py-2 px-3 text-foreground font-medium">Fixed Acquirer Levy</td>
                        <td className="py-2 px-3 text-muted-foreground">Flat gateway transaction fee</td>
                        <td className="py-2 px-3 text-right text-muted-foreground">
                          -{formatMinorUnits(simulationResult.data.fixedFeeMinor, feeAgreement.currency)}
                        </td>
                      </tr>
                      <tr className="bg-secondary/20 font-bold">
                        <td className="py-2 px-3 text-foreground">Total Fee Deductions</td>
                        <td className="py-2 px-3 text-muted-foreground font-normal">
                          Deterministic Round-Half-Up
                        </td>
                        <td className="py-2 px-3 text-right text-foreground">
                          -{formatMinorUnits(simulationResult.data.totalFeeMinor, feeAgreement.currency)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Calendar Shift & Cut-off Explanation */}
                <div className="p-3.5 rounded-lg border border-border/70 bg-secondary/15 space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Calendar Clearance Reasoning</span>
                  </div>
                  <div className="space-y-1 text-[11px] text-muted-foreground leading-relaxed">
                    <p>
                      • <strong>Capture Time:</strong> {transactionTimeUtc}
                    </p>
                    <p>
                      • <strong>Acquirer Cut-Off:</strong> {settlementPolicy.cutOffTimeUtc} UTC ({settlementPolicy.timezone})
                    </p>
                    <p>
                      • <strong>Cut-Off Shift:</strong> {simulationResult.data.isPastCutOff ? "Yes (Past cut-off window, +1 business day)" : "No (Processed within same day batch)"}
                    </p>
                    <p>
                      • <strong>Audit Trail:</strong> {simulationResult.data.settlementAdjustments.join(" → ") || "Standard business day clearance without additional holiday deferrals"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-destructive/40 p-6 text-center space-y-2">
              <p className="text-sm font-semibold text-destructive">Calculation Error</p>
              <p className="text-xs text-muted-foreground font-mono">{simulationResult.error}</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
