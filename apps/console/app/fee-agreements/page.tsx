"use client";

import React, { useState } from "react";
import { useWorkspace } from "@/components/workspace-context";
import { formatMinorUnits, formatBps } from "@/lib/utils";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function FeeAgreementsPage() {
  const { feeAgreements, addFeeAgreement } = useWorkspace();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [percentageBps, setPercentageBps] = useState("250");
  const [fixedFeeCents, setFixedFeeCents] = useState("30");
  const [minFeeCents, setMinFeeCents] = useState("");
  const [maxFeeCents, setMaxFeeCents] = useState("");
  const [priority] = useState("10");
  const [description, setDescription] = useState("");
  const [currency] = useState("USD");

  // Sample Transaction Preview Amount ($10,000)
  const previewGross = 1000000n; // 1,000,000 minor units ($10,000.00)

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addFeeAgreement({
      name: name.trim(),
      version: "v1.0",
      status: "ACTIVE",
      percentageBps: parseInt(percentageBps, 10) || 0,
      fixedFeeMinor: BigInt(fixedFeeCents || "0"),
      minFeeMinor: minFeeCents ? BigInt(minFeeCents) : undefined,
      maxFeeMinor: maxFeeCents ? BigInt(maxFeeCents) : undefined,
      priority: parseInt(priority, 10) || 1,
      effectiveFrom: new Date().toISOString().split("T")[0] || "2026-01-01",
      description: description || "Custom merchant discount rate agreement.",
      currency,
    });

    setName("");
    setDescription("");
    setShowAddModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Fee Agreement Management
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Model merchant discount rates (MDR), interchange pass-through, fixed acquirer surcharges, and fee caps.
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>New Fee Agreement</span>
        </Button>
      </div>

      {/* Agreements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {feeAgreements.map((agreement) => {
          // Calculate sample calculation for $10,000 transaction
          const mdrPortion = (previewGross * BigInt(agreement.percentageBps)) / 10000n;
          let totalFee = mdrPortion + agreement.fixedFeeMinor;

          if (agreement.minFeeMinor && totalFee < agreement.minFeeMinor) {
            totalFee = agreement.minFeeMinor;
          }
          if (agreement.maxFeeMinor && totalFee > agreement.maxFeeMinor) {
            totalFee = agreement.maxFeeMinor;
          }

          const netPayout = previewGross - totalFee;

          return (
            <Card key={agreement.id} className="hover:border-foreground/30 transition-colors flex flex-col justify-between">
              <div>
                <CardHeader className="border-b border-border/60 pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-sm font-semibold">
                          {agreement.name}
                        </CardTitle>
                        <Badge variant="outline" className="text-[9px] font-mono">
                          {agreement.version}
                        </Badge>
                      </div>
                      <p className="text-[11px] font-mono text-muted-foreground">
                        ID: {agreement.id} · Priority: {agreement.priority}
                      </p>
                    </div>

                    <Badge
                      variant={agreement.status === "ACTIVE" ? "success" : "outline"}
                      className="text-[9px]"
                    >
                      {agreement.status}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4 text-xs">
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {agreement.description}
                  </p>

                  {/* Core Formula Parameters */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-2.5 rounded-lg border border-border/60 bg-secondary/30 space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">MDR Rate</span>
                      <p className="text-sm font-bold font-mono text-foreground">
                        {formatBps(agreement.percentageBps)}
                      </p>
                      <p className="text-[9px] text-muted-foreground">{agreement.percentageBps} bps</p>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/60 bg-secondary/30 space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">Fixed Fee</span>
                      <p className="text-sm font-bold font-mono text-foreground">
                        {formatMinorUnits(agreement.fixedFeeMinor, agreement.currency)}
                      </p>
                      <p className="text-[9px] text-muted-foreground">Minor units</p>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/60 bg-secondary/30 space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">Min Floor</span>
                      <p className="text-sm font-bold font-mono text-foreground">
                        {agreement.minFeeMinor ? formatMinorUnits(agreement.minFeeMinor, agreement.currency) : "None"}
                      </p>
                      <p className="text-[9px] text-muted-foreground">Threshold</p>
                    </div>

                    <div className="p-2.5 rounded-lg border border-border/60 bg-secondary/30 space-y-0.5">
                      <span className="text-[10px] text-muted-foreground uppercase font-mono">Max Cap</span>
                      <p className="text-sm font-bold font-mono text-foreground">
                        {agreement.maxFeeMinor ? formatMinorUnits(agreement.maxFeeMinor, agreement.currency) : "None"}
                      </p>
                      <p className="text-[9px] text-muted-foreground">Ceiling</p>
                    </div>
                  </div>

                  {/* Live Calculation Preview on $10,000 */}
                  <div className="p-3 rounded-lg border border-border/70 bg-background/50 space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono">
                      <span className="text-muted-foreground">Sample Gross: $10,000.00</span>
                      <span className="text-foreground font-semibold">Total Fee: {formatMinorUnits(totalFee, agreement.currency)}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-mono font-bold border-t border-border/50 pt-1.5">
                      <span className="text-foreground">Net Payout to Merchant:</span>
                      <span className="text-foreground">{formatMinorUnits(netPayout, agreement.currency)}</span>
                    </div>
                  </div>
                </CardContent>
              </div>

              <div className="px-5 pb-4 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                <span>Effective From: {agreement.effectiveFrom}</span>
                <span className="text-foreground font-medium">Deterministic Round-Half-Up</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Add Fee Agreement Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl border-foreground/30 bg-background">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-base font-semibold">
                Configure New MDR Fee Agreement
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleCreate} className="p-4 sm:p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground text-[11px]">
                  Agreement Name / Tier Label
                </label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Standard Corporate Interchange Blended"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground text-[11px]">
                    Percentage Rate (Basis Points)
                  </label>
                  <Input
                    required
                    type="number"
                    value={percentageBps}
                    onChange={(e) => setPercentageBps(e.target.value)}
                    placeholder="250"
                    className="text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    250 bps = 2.50%
                  </p>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-foreground text-[11px]">
                    Fixed Acquirer Levy (Minor Units)
                  </label>
                  <Input
                    required
                    type="number"
                    value={fixedFeeCents}
                    onChange={(e) => setFixedFeeCents(e.target.value)}
                    placeholder="30"
                    className="text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    30 units = $0.30 USD
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground text-[11px]">
                    Minimum Fee Floor (Optional Minor Units)
                  </label>
                  <Input
                    type="number"
                    value={minFeeCents}
                    onChange={(e) => setMinFeeCents(e.target.value)}
                    placeholder="25"
                    className="text-xs font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-foreground text-[11px]">
                    Maximum Fee Cap (Optional Minor Units)
                  </label>
                  <Input
                    type="number"
                    value={maxFeeCents}
                    onChange={(e) => setMaxFeeCents(e.target.value)}
                    placeholder="50000"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground text-[11px]">
                  Description / Contract Rationale
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Acquirer interchange pass-through schedule..."
                  className="text-xs"
                />
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowAddModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="default">
                  Save Fee Agreement
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
