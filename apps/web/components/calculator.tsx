"use client";

import React, { useState, useMemo } from "react";
import { calculatePaymentSettlementEstimate } from "@trivio.ink/core";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Calendar, DollarSign, Calculator as CalcIcon, CheckCircle2, AlertTriangle } from "lucide-react";

export function SettlementCalculator() {
  // User inputs (in standard monetary units)
  const [grossAmount, setGrossAmount] = useState<string>("10000.00");
  const [percentageBps, setPercentageBps] = useState<number>(250); // 2.50%
  const [fixedFeeDollars, setFixedFeeDollars] = useState<string>("15.00");
  const [cycleDays, setCycleDays] = useState<number>(1); // T+1
  const [cutOffTime, setCutOffTime] = useState<string>("16:00");
  const [transactionDate, setTransactionDate] = useState<string>("2026-11-16");
  const [transactionTime, setTransactionTime] = useState<string>("14:30");

  // Calculate settlement using official @trivio.ink/core engine
  const calculationResult = useMemo(() => {
    try {
      // Parse gross amount into minor units (cents) as integer
      const parsedAmount = parseFloat(grossAmount);
      if (isNaN(parsedAmount) || parsedAmount <= 0) {
        return null;
      }
      const grossMinor = Math.round(parsedAmount * 100);

      // Parse fixed fee into minor units
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
    <div className="w-full max-w-5xl mx-auto space-y-6">
      {/* Configuration Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-trivio-border bg-trivio-navy/80">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-trivio-warm">
                  <CalcIcon className="w-5 h-5 text-trivio-cyan" />
                  Transaction & Fee Inputs
                </CardTitle>
                <Badge variant="cyan">Zero-Float Math</Badge>
              </div>
              <CardDescription>
                Configure the transaction gross amount and merchant agreement terms.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Gross Amount */}
              <div>
                <label className="block text-xs font-medium text-gray-300 mb-1.5">
                  Gross Transaction Amount (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                  <Input
                    type="number"
                    step="0.01"
                    min="1"
                    value={grossAmount}
                    onChange={(e) => setGrossAmount(e.target.value)}
                    className="pl-9 font-mono"
                    placeholder="10000.00"
                  />
                </div>
              </div>

              {/* MDR Percentage Rate */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
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
                      className="font-mono"
                    />
                    <span className="absolute right-3 top-2 text-xs text-gray-500">bps</span>
                  </div>
                  <span className="text-[10px] text-gray-500">100 bps = 1.00%</span>
                </div>

                {/* Fixed Fee */}
                <div>
                  <label className="block text-xs font-medium text-gray-300 mb-1.5">
                    Fixed Transaction Fee
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
                    <Input
                      type="number"
                      step="0.01"
                      min="0"
                      value={fixedFeeDollars}
                      onChange={(e) => setFixedFeeDollars(e.target.value)}
                      className="pl-9 font-mono"
                    />
                  </div>
                  <span className="text-[10px] text-gray-500">e.g. $15.00 wire / batch</span>
                </div>
              </div>

              {/* Settlement Policy Parameters */}
              <div className="pt-2 border-t border-trivio-border/60">
                <h4 className="text-xs font-semibold text-trivio-warm mb-3 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-trivio-cyan" />
                  Settlement Calendar & Policy
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">
                      Settlement Cycle
                    </label>
                    <select
                      value={cycleDays}
                      onChange={(e) => setCycleDays(Number(e.target.value))}
                      className="w-full h-10 rounded-md border border-trivio-border bg-trivio-midnight px-3 text-xs text-trivio-warm focus:outline-none focus:ring-2 focus:ring-trivio-cyan font-mono"
                    >
                      <option value={1}>T+1 (Next business day)</option>
                      <option value={2}>T+2 (Two business days)</option>
                      <option value={3}>T+3 (Three business days)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">
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

                <div className="grid grid-cols-2 gap-4 mt-3">
                  <div>
                    <label className="block text-[11px] text-gray-400 mb-1">
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
                    <label className="block text-[11px] text-gray-400 mb-1">
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

        {/* Results Card */}
        <div className="lg:col-span-6 space-y-6">
          <Card className="border-trivio-border bg-trivio-navy/80 h-full flex flex-col justify-between">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2 text-trivio-warm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Deterministic Settlement Output
                </CardTitle>
                <Badge variant="emerald">Live @trivio.ink/core</Badge>
              </div>
              <CardDescription>
                Calculated locally without cloud round-trips or IEEE-754 float drift.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {calculationResult ? (
                <>
                  {/* Big Net Figure */}
                  <div className="rounded-lg border border-cyan-500/30 bg-trivio-midnight/90 p-5 text-center">
                    <span className="text-xs uppercase tracking-wider text-gray-400 font-semibold">
                      Estimated Net Settlement Amount
                    </span>
                    <div className="text-4xl font-mono font-bold text-trivio-cyan mt-1">
                      ${calculationResult.net.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </div>
                    <span className="text-[11px] text-gray-500 mt-1 block">
                      Gross ${calculationResult.gross.toFixed(2)} minus ${calculationResult.totalFee.toFixed(2)} fees
                    </span>
                  </div>

                  {/* Fee Breakdown Table */}
                  <div className="space-y-2.5 text-xs">
                    <div className="flex justify-between py-1.5 border-b border-trivio-border/60">
                      <span className="text-gray-400">Gross Transaction Amount:</span>
                      <span className="font-mono font-medium text-trivio-warm">
                        ${calculationResult.gross.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-trivio-border/60">
                      <span className="text-gray-400">
                        Percentage Fee ({((percentageBps || 0) / 100).toFixed(2)}%):
                      </span>
                      <span className="font-mono text-amber-400">
                        -${calculationResult.percentageFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-trivio-border/60">
                      <span className="text-gray-400">Fixed Transaction Fee:</span>
                      <span className="font-mono text-amber-400">
                        -${calculationResult.fixedFee.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-trivio-border/60 font-semibold">
                      <span className="text-gray-300">Total Deductions:</span>
                      <span className="font-mono text-amber-400">
                        -${calculationResult.totalFee.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Timeline Badge */}
                  <div className="rounded-md border border-trivio-border bg-trivio-midnight p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-400 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-trivio-cyan" />
                        Expected Settlement Date:
                      </span>
                      <span className="text-sm font-mono font-bold text-emerald-400">
                        {calculationResult.settlementDate}
                      </span>
                    </div>
                    {calculationResult.isPastCutOff && (
                      <div className="flex items-center gap-1.5 text-[11px] text-amber-400 bg-amber-500/10 px-2 py-1 rounded">
                        <AlertTriangle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span>Transaction submitted past {cutOffTime} UTC cut-off; calendar shifted to next cycle.</span>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="py-12 text-center text-gray-500 text-sm">
                  Please enter a valid positive gross transaction amount.
                </div>
              )}

              {/* Code snippet trigger */}
              <div className="pt-2 text-[11px] text-gray-500 border-t border-trivio-border/60">
                <span className="font-mono text-trivio-cyan">Trivio Financial Invariant:</span> Precision is preserved down to exact minor units using BigInt integer arithmetic with Round-Half-Up (<code className="font-mono text-trivio-cyan">roundHalfUpDiv</code>).
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
