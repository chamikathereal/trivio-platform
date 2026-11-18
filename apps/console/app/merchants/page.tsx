"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useWorkspace } from "@/components/workspace-context";
import { formatMinorUnits, formatBps } from "@/lib/utils";
import {
  Plus,
  Search,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function MerchantsPage() {
  const {
    merchants,
    feeAgreements,
    settlementPolicies,
    selectedMerchantId,
    setSelectedMerchantId,
    addMerchant,
  } = useWorkspace();

  const [search, setSearch] = useState("");
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Merchant Form State
  const [newName, setNewName] = useState("");
  const [newCurrency, setNewCurrency] = useState("USD");
  const [newAcquirer, setNewAcquirer] = useState("Adyen Global Acquiring");
  const [newAcquirerId, setNewAcquirerId] = useState("acq_adyen_tier1");
  const [newFeeAgreementId, setNewFeeAgreementId] = useState(feeAgreements[0]?.id || "");
  const [newSettlementPolicyId, setNewSettlementPolicyId] = useState(settlementPolicies[0]?.id || "");
  const [newVolume, setNewVolume] = useState("250000");

  const filteredMerchants = merchants.filter(
    (m) =>
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.currency.toLowerCase().includes(search.toLowerCase()) ||
      m.acquirerName.toLowerCase().includes(search.toLowerCase())
  );

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;

    addMerchant({
      name: newName.trim(),
      slug: newName.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      status: "ACTIVE",
      acquirerId: newAcquirerId,
      acquirerName: newAcquirer,
      currency: newCurrency,
      feeAgreementId: newFeeAgreementId,
      settlementPolicyId: newSettlementPolicyId,
      monthlyVolumeEstimateMinor: BigInt(Math.round(parseFloat(newVolume || "0") * 100)),
      timezone: "America/New_York",
    });

    setNewName("");
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">
            Merchant Workspaces
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure merchant acquiring identities, settlement schedules, and independent fee contracts.
          </p>
        </div>

        <Button
          onClick={() => setShowCreateModal(true)}
          size="sm"
          className="gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Merchant</span>
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by merchant, currency, or acquirer..."
            className="pl-8 text-xs h-8"
          />
        </div>

        <div className="text-xs text-muted-foreground font-mono">
          Showing {filteredMerchants.length} of {merchants.length} merchants
        </div>
      </div>

      {/* Merchant Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMerchants.map((merchant) => {
          const isSelected = merchant.id === selectedMerchantId;
          const fee = feeAgreements.find((f) => f.id === merchant.feeAgreementId);
          const policy = settlementPolicies.find((p) => p.id === merchant.settlementPolicyId);

          return (
            <Card
              key={merchant.id}
              className={`transition-all duration-200 ${
                isSelected
                  ? "border-foreground ring-1 ring-foreground/20 shadow-md bg-secondary/30"
                  : "hover:border-foreground/40 hover:bg-secondary/15"
              }`}
            >
              <CardHeader className="pb-3 border-b border-border/60">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 min-w-0">
                    <CardTitle className="text-sm font-semibold truncate flex items-center gap-2">
                      <span>{merchant.name}</span>
                    </CardTitle>
                    <p className="text-[11px] font-mono text-muted-foreground truncate">
                      {merchant.id} · {merchant.currency}
                    </p>
                  </div>
                  <Badge
                    variant={merchant.status === "ACTIVE" ? "success" : "outline"}
                    className="text-[9px]"
                  >
                    {merchant.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-3 space-y-3 text-xs">
                {/* Details list */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Acquirer:</span>
                    <span className="font-medium text-foreground truncate max-w-[170px]">
                      {merchant.acquirerName}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Fee Tier:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {fee ? `${formatBps(fee.percentageBps)} + ${formatMinorUnits(fee.fixedFeeMinor, fee.currency)}` : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Settlement Cycle:</span>
                    <span className="font-mono text-foreground font-semibold">
                      {policy ? `T+${policy.cycleDays} (${policy.cutOffTimeUtc} UTC)` : "—"}
                    </span>
                  </div>

                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-muted-foreground">Monthly Estimate:</span>
                    <span className="font-mono text-foreground">
                      {formatMinorUnits(merchant.monthlyVolumeEstimateMinor, merchant.currency)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-2 border-t border-border/60 flex items-center justify-between gap-2">
                  {isSelected ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-foreground">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Active Workspace
                    </span>
                  ) : (
                    <Button
                      onClick={() => setSelectedMerchantId(merchant.id)}
                      size="sm"
                      variant="outline"
                      className="h-7 text-[11px]"
                    >
                      Set Active
                    </Button>
                  )}

                  <Button asChild size="sm" variant="default" className="h-7 text-[11px] gap-1">
                    <Link href={`/simulation?merchant=${merchant.id}`}>
                      <span>Simulate</span>
                      <ArrowRight className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Create Merchant Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl border-foreground/30 bg-background">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-base font-semibold">
                Configure New Merchant Workspace
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleCreate} className="p-4 sm:p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground text-[11px]">
                  Merchant Organization Name
                </label>
                <Input
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="e.g. Acme FinTech Corp"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground text-[11px]">
                    Settlement Currency
                  </label>
                  <select
                    value={newCurrency}
                    onChange={(e) => setNewCurrency(e.target.value)}
                    className="w-full h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs focus:ring-1 focus:ring-ring"
                  >
                    <option value="USD">USD — US Dollar</option>
                    <option value="EUR">EUR — Euro</option>
                    <option value="GBP">GBP — British Pound</option>
                    <option value="LKR">LKR — Sri Lankan Rupee</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-foreground text-[11px]">
                    Expected Monthly Volume ($)
                  </label>
                  <Input
                    type="number"
                    value={newVolume}
                    onChange={(e) => setNewVolume(e.target.value)}
                    placeholder="250000"
                    className="text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground text-[11px]">
                  Acquiring Partner
                </label>
                <select
                  value={newAcquirer}
                  onChange={(e) => {
                    setNewAcquirer(e.target.value);
                    setNewAcquirerId(`acq_${e.target.value.toLowerCase().replace(/[^a-z0-9]+/g, "_")}`);
                  }}
                  className="w-full h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs focus:ring-1 focus:ring-ring"
                >
                  <option value="J.P. Morgan Payments">J.P. Morgan Payments</option>
                  <option value="Stripe Custom Connect">Stripe Custom Connect</option>
                  <option value="Commercial Bank of Ceylon">Commercial Bank of Ceylon</option>
                  <option value="Barclays Merchant Services">Barclays Merchant Services</option>
                  <option value="Adyen Global Acquiring">Adyen Global Acquiring</option>
                  <option value="Checkout.com">Checkout.com</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground text-[11px]">
                    Assign Fee Agreement
                  </label>
                  <select
                    value={newFeeAgreementId}
                    onChange={(e) => setNewFeeAgreementId(e.target.value)}
                    className="w-full h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs focus:ring-1 focus:ring-ring truncate"
                  >
                    {feeAgreements.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({formatBps(f.percentageBps)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-foreground text-[11px]">
                    Assign Settlement Policy
                  </label>
                  <select
                    value={newSettlementPolicyId}
                    onChange={(e) => setNewSettlementPolicyId(e.target.value)}
                    className="w-full h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs focus:ring-1 focus:ring-ring truncate"
                  >
                    {settlementPolicies.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (T+{p.cycleDays})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-border/60 flex items-center justify-end gap-2.5">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm" variant="default">
                  Create Workspace
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
