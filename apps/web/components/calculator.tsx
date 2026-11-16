"use client";

import React, { useState, useMemo } from "react";
import { calculatePaymentSettlementEstimate } from "@trivio.ink/core";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Calendar, DollarSign, Calculator as CalcIcon, CheckCircle2, AlertCircle } from "lucide-react";

export function SettlementCalculator() {
  // User inputs (in standard monetary units)
  const [grossAmount, setGrossAmount] = useState<string>("500.00");
  const [percentageBps, setPercentageBps] = useState<number>(250); // 2.50%
  const [fixedFeeDollars, setFixedFeeDollars] = useState<string>("15.00");
  const [cycleDays, setCycleDays] = useState<number>(2); // T+2
  const [cutOffTime, setCutOffTime] = useState<string>("16:00");
  const [transactionDate, setTransactionDate] = useState<string>("2026-11-16");
  const [transactionTime, setTransactionTime] = useState<string>("14:30");

  // Calculate settlement using official @trivio.ink/core deterministic engine
  const calculationResult = useMemo(() => {
    try {
      const parsedAmount = parseFloat(grossAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return null;
      }
      const grossMinor = Math.round(parsedAmount * 100);

      const parsedFixed = parseFloat(fixedFeeDollars);
      const fixedFeeMinor = isNaN(parsedFixed) ? 0 : Math.round(parsedFixed * 100);

      const isoDateTime = `${transactionDate}T${transactionTime}:00Z`;
      const cutOffFormatted = cutOffTime.length === 5 ? `${cutOffTime}:00` : cutOffTime;

      const estimate = calculatePaymentSettlementEstimate(
        {
          grossMinor,
          currency: "USD",
          transactionTime: isoDateTime,
          acquirerId: "ACQ_DEMO",
        },
        {
          feeRules: [
            {
              id: "RULE_MDR_DEMO",
              version: "1.0.0",
              priority: 10,
              acquirerId: "ACQ_DEMO",
              currency: "USD",
              effectiveFrom: "2026-01-01",
              rateSource: "merchant_configured",
              feeStructure: {
                rateBasisPoints: Number(percentageBps),
                fixedFeeMinor,
              },
            },
          ],
          settlementPolicies: [
            {
              id: "POLICY_DEMO",
              version: "1.0.0",
              acquirerId: "ACQ_DEMO",
              currency: "USD",
              effectiveFrom: "2026-01-01",
              cycleLength: Number(cycleDays),
              cycleUnit: "business_days",
              cutOffTime: cutOffFormatted,
              timeZone: "UTC",
              calendarId: "CAL_GLOBAL",
            },
          ],
          calendars: [
            {
              id: "CAL_GLOBAL",
              version: "2026.1",
              timeZone: "UTC",
              workingDays: [1, 2, 3, 4, 5],
              holidays: ["2026-12-25", "2027-01-01"],
            },
          ],
        }
      );

      return {
        gross: estimate.grossMinor / 100,
        percentageFee: estimate.percentageFeeMinor / 100,
        fixedFee: estimate.fixedFeeMinor / 100,
        totalFee: estimate.totalFeeMinor / 100,
        net: estimate.netMinor / 100,
        settlementDate: estimate.expectedSettlementDate,
        isPastCutOff: estimate.isPastCutOff,
        status: estimate.status,
      };
    } catch (err) {
      console.error("Calculation error:", err);
      return null;
    }
  }, [grossAmount, percentageBps, fixedFeeDollars, cycleDays, cutOffTime, transactionDate, transactionTime]);

  return (
    <div className="w-full max-w-5xl mx-auto space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Input Console */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-border bg-card/80 backdrop-blur-xl shadow-lg">
            <CardHeader className="pb-4 border-b border-border/60">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <CalcIcon className="w-4 h-4 text-foreground" />
                  Transaction & Fee Inputs
                </CardTitle>
                <Badge variant="outline" className="font-mono text-[10px]">
                  Zero-Float Math
                </Badge>
              </div>
              <CardDescription>
                Configure the gross transaction amount, merchant discount rate, and acquirer rules.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 pt-5">
              {/* Gross Amount Input */}
              <div>
                <label className="block text-xs font-semibold text-foreground mb-1.5">
                  Gross Transaction Amount (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    value={grossAmount}
                    onChange={(e) => setGrossAmount(e.target.value)}
                    className="pl-10 font-mono text-base font-semibold"
                    placeholder="500.00"
                  />
                </div>
              </div>

              {/* Rate & Fixed Fee Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    MDR Rate ({((percentageBps || 0) / 100).toFixed(2)}%)
                  </label>
                  <div className="relative">
                    <Input
                      type="number"
                      step="5"
                      min="0"
                      max="1000"
                      value={percentageBps}
                      onChange={(e) => setPercentageBps(Number(e.target.value))}
                      className="font-mono pr-12"
                    />
                    <span className="absolute right-3.5 top-2.5 text-xs text-muted-foreground font-mono">
                      bps
                    </span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    100 bps = 1.00%
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-foreground mb-1.5">
                    Fixed Transaction Fee
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={fixedFeeDollars}
                      onChange={(e) => setFixedFeeDollars(e.target.value)}
                      className="pl-10 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Flat per transaction
                  </span>
                </div>
              </div>

              {/* Settlement Calendar & Cut-Off */}
              <div className="pt-4 border-t border-border/80 space-y-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-foreground" />
                  <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                    Settlement Calendar & Policy
                  </h4>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Settlement Cycle
                    </label>
                    <select
                      value={cycleDays}
                      onChange={(e) => setCycleDays(Number(e.target.value))}
                      className="w-full h-10 rounded-xl border border-border bg-background/80 px-3 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-foreground font-mono transition-colors"
                    >
                      <option value={1}>T+1 (Next business day)</option>
                      <option value={2}>T+2 (Two business days)</option>
                      <option value={3}>T+3 (Three business days)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Daily Bank Cut-Off (UTC)
                    </label>
                    <Input
                      type="text"
                      value={cutOffTime}
                      onChange={(e) => setCutOffTime(e.target.value)}
                      className="font-mono text-xs"
                      placeholder="16:00"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Transaction Date
                    </label>
                    <Input
                      type="date"
                      value={transactionDate}
                      onChange={(e) => setTransactionDate(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-muted-foreground mb-1">
                      Transaction Time (UTC)
                    </label>
                    <Input
                      type="time"
                      value={transactionTime}
                      onChange={(e) => setTransactionTime(e.target.value)}
                      className="font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Deterministic Settlement Output */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-border bg-card/80 backdrop-blur-xl shadow-lg h-full flex flex-col justify-between">
            <div>
              <CardHeader className="pb-4 border-b border-border/60">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-foreground" />
                    Deterministic Output
                  </CardTitle>
                  <Badge variant="default" className="font-mono text-[10px]">
                    Live @trivio.ink/core
                  </Badge>
                </div>
                <CardDescription>
                  Computed locally with zero network round-trips and zero IEEE-754 penny drift.
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-6 pt-6">
                {calculationResult ? (
                  <>
                    {/* Big Net Figure Console */}
                    <div className="rounded-2xl border border-border bg-secondary/40 p-6 text-center space-y-1">
                      <span className="text-[11px] uppercase tracking-wider text-muted-foreground font-semibold">
                        Estimated Net Settlement Payout
                      </span>
                      <div className="text-5xl font-mono font-bold tracking-tight text-foreground py-2">
                        ${calculationResult.net.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <span className="text-xs text-muted-foreground block font-mono">
                        Gross ${calculationResult.gross.toFixed(2)} − ${calculationResult.totalFee.toFixed(2)} deductions
                      </span>
                    </div>

                    {/* Breakdown Ledger Table */}
                    <div className="space-y-3 text-xs">
                      <div className="flex justify-between py-2 border-b border-border/60">
                        <span className="text-muted-foreground">Gross Transaction:</span>
                        <span className="font-mono font-semibold text-foreground">
                          ${calculationResult.gross.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border/60">
                        <span className="text-muted-foreground">
                          Percentage MDR ({((percentageBps || 0) / 100).toFixed(2)}%):
                        </span>
                        <span className="font-mono font-medium text-foreground">
                          −${calculationResult.percentageFee.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border/60">
                        <span className="text-muted-foreground">Fixed Acquirer Fee:</span>
                        <span className="font-mono font-medium text-foreground">
                          −${calculationResult.fixedFee.toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between py-2 border-b border-border/60 font-semibold text-foreground">
                        <span>Total Fee Deductions:</span>
                        <span className="font-mono">
                          −${calculationResult.totalFee.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Expected Settlement Date Pill */}
                    <div className="rounded-xl border border-border bg-background/60 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-foreground" />
                          Expected Clearance Date:
                        </span>
                        <span className="text-sm font-mono font-bold text-foreground">
                          {calculationResult.settlementDate}
                        </span>
                      </div>
                      {calculationResult.isPastCutOff && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-secondary/80 px-3 py-2 rounded-lg mt-2">
                          <AlertCircle className="w-4 h-4 text-foreground flex-shrink-0" />
                          <span>Submitted past {cutOffTime} UTC cut-off; calendar rolled forward to next clearing day.</span>
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="py-16 text-center text-muted-foreground text-sm">
                    Enter a positive transaction gross amount to compute deterministic settlement.
                  </div>
                )}
              </CardContent>
            </div>

            <div className="p-6 pt-0 text-[11px] text-muted-foreground border-t border-border/40 mt-4">
              <strong className="text-foreground">Deterministic Invariant:</strong> Calculations use integer BigInt arithmetic with verified Round-Half-Up (<code className="font-mono text-foreground">roundHalfUpDiv</code>).
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
