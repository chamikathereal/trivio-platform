"use client";

import React, { useState } from "react";
import { useWorkspace } from "@/components/workspace-context";
import { Plus, Globe, CalendarX2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettlementPoliciesPage() {
  const { settlementPolicies, addSettlementPolicy } = useWorkspace();
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [name, setName] = useState("");
  const [cycleDays, setCycleDays] = useState("2");
  const [cutOffTimeUtc, setCutOffTimeUtc] = useState("16:00");
  const [weekendHandling, setWeekendHandling] = useState<"following_business_day" | "preceding_business_day" | "no_adjustment">("following_business_day");
  const [timezone, setTimezone] = useState("America/New_York");
  const [description, setDescription] = useState("");
  const [holidayInput, setHolidayInput] = useState("2026-12-25, 2027-01-01");

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const holidays = holidayInput
      .split(",")
      .map((h) => h.trim())
      .filter((h) => /^\d{4}-\d{2}-\d{2}$/.test(h));

    addSettlementPolicy({
      name: name.trim(),
      version: "v1.0",
      status: "ACTIVE",
      cycleDays: parseInt(cycleDays, 10) || 1,
      cutOffTimeUtc,
      weekendHandling,
      holidays,
      timezone,
      description: description || "Custom bank clearance calendar schedule.",
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
            Settlement Policy Builder
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure clearing batch cycles, daily bank cut-off windows, and central bank holiday calendars.
          </p>
        </div>

        <Button onClick={() => setShowAddModal(true)} size="sm" className="gap-1.5 shadow-sm">
          <Plus className="w-4 h-4" />
          <span>New Settlement Policy</span>
        </Button>
      </div>

      {/* Policies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {settlementPolicies.map((policy) => (
          <Card key={policy.id} className="hover:border-foreground/30 transition-colors flex flex-col justify-between">
            <div>
              <CardHeader className="border-b border-border/60 pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-sm font-semibold">
                        {policy.name}
                      </CardTitle>
                      <Badge variant="outline" className="text-[9px] font-mono">
                        {policy.version}
                      </Badge>
                    </div>
                    <p className="text-[11px] font-mono text-muted-foreground">
                      ID: {policy.id} · IANA: {policy.timezone}
                    </p>
                  </div>

                  <Badge
                    variant={policy.status === "ACTIVE" ? "success" : "outline"}
                    className="text-[9px]"
                  >
                    {policy.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="pt-4 space-y-4 text-xs">
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {policy.description}
                </p>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-2.5 rounded-lg border border-border/60 bg-secondary/30 space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Cycle Length</span>
                    <p className="text-sm font-bold font-mono text-foreground">
                      T+{policy.cycleDays}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Business Days</p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-secondary/30 space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Cut-Off Window</span>
                    <p className="text-sm font-bold font-mono text-foreground">
                      {policy.cutOffTimeUtc} UTC
                    </p>
                    <p className="text-[9px] text-muted-foreground">Daily Batch Close</p>
                  </div>

                  <div className="p-2.5 rounded-lg border border-border/60 bg-secondary/30 space-y-0.5">
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Weekend Shift</span>
                    <p className="text-xs font-bold font-mono text-foreground truncate">
                      {policy.weekendHandling.replace(/_/g, " ")}
                    </p>
                    <p className="text-[9px] text-muted-foreground">Convention</p>
                  </div>
                </div>

                {/* Configured Holidays */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-semibold text-foreground flex items-center gap-1.5">
                    <CalendarX2 className="w-3.5 h-3.5" />
                    <span>Jurisdiction Bank Holidays ({policy.holidays.length})</span>
                  </span>

                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto terminal-scroll p-1">
                    {policy.holidays.map((h) => (
                      <span
                        key={h}
                        className="px-2 py-0.5 rounded-md border border-border/70 bg-secondary/40 text-[10px] font-mono text-foreground"
                      >
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </div>

            <div className="px-5 pb-4 pt-2 border-t border-border/60 flex items-center justify-between text-[11px] text-muted-foreground font-mono">
              <span className="flex items-center gap-1">
                <Globe className="w-3 h-3 text-foreground" />
                <span>Zone: {policy.timezone}</span>
              </span>
              <span className="text-foreground font-medium">Holiday-Aware Invariant</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Add Settlement Policy Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <Card className="w-full max-w-lg shadow-2xl border-foreground/30 bg-background">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-base font-semibold">
                Configure Settlement Calendar Policy
              </CardTitle>
            </CardHeader>

            <form onSubmit={handleCreate} className="p-4 sm:p-5 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-medium text-foreground text-[11px]">
                  Policy Name / Acquirer Schedule
                </label>
                <Input
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. European Central Bank TARGET2 T+1"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground text-[11px]">
                    Settlement Cycle (Days)
                  </label>
                  <select
                    value={cycleDays}
                    onChange={(e) => setCycleDays(e.target.value)}
                    className="w-full h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs focus:ring-1 focus:ring-ring font-mono"
                  >
                    <option value="0">T+0 (Same-Day Immediate Settlement)</option>
                    <option value="1">T+1 (Next-Business-Day)</option>
                    <option value="2">T+2 (Standard Card Network)</option>
                    <option value="3">T+3 (Cross-Border Nostro)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-foreground text-[11px]">
                    Daily Cut-Off Time (UTC)
                  </label>
                  <Input
                    required
                    value={cutOffTimeUtc}
                    onChange={(e) => setCutOffTimeUtc(e.target.value)}
                    placeholder="16:00"
                    className="text-xs font-mono"
                  />
                  <p className="text-[10px] text-muted-foreground">
                    Transactions past cut-off shift +1 day
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-medium text-foreground text-[11px]">
                    Weekend Non-Working Handling
                  </label>
                  <select
                    value={weekendHandling}
                    onChange={(e) => setWeekendHandling(e.target.value as any)}
                    className="w-full h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs focus:ring-1 focus:ring-ring"
                  >
                    <option value="following_business_day">following_business_day (Roll to Next Monday)</option>
                    <option value="preceding_business_day">preceding_business_day (Roll to Friday)</option>
                    <option value="no_adjustment">no_adjustment (Retain Calendar Day)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-medium text-foreground text-[11px]">
                    Clearing Timezone
                  </label>
                  <select
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    className="w-full h-8 rounded-md border border-border/80 bg-background px-2.5 text-xs focus:ring-1 focus:ring-ring"
                  >
                    <option value="America/New_York">America/New_York (US Eastern)</option>
                    <option value="Europe/London">Europe/London (UK GMT/BST)</option>
                    <option value="Asia/Colombo">Asia/Colombo (Sri Lanka IST)</option>
                    <option value="Europe/Paris">Europe/Paris (CET)</option>
                    <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground text-[11px]">
                  Bank Holidays (Comma-separated YYYY-MM-DD)
                </label>
                <Input
                  value={holidayInput}
                  onChange={(e) => setHolidayInput(e.target.value)}
                  placeholder="2026-12-25, 2027-01-01"
                  className="text-xs font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="font-medium text-foreground text-[11px]">
                  Description / Acquirer Policy Reference
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Fedwire clearance schedule with 16:00 cut-off..."
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
                  Save Policy
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
