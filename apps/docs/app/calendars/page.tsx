import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Settlement Calendars & Cycles — Trivio Docs",
  description: "Configure T+N cycles, bank working days, and public holiday shifts.",
};

const calendarExample = `import { SettlementCalendar, SettlementPolicy } from "@trivio.ink/core";

// 1. Regional clearing house calendar
export const srilankaCalendar: SettlementCalendar = {
  id: "CAL_LK_CENTRAL_BANK",
  version: "2026.1",
  timeZone: "Asia/Colombo",
  workingDays: [1, 2, 3, 4, 5], // Monday through Friday
  holidays: [
    "2026-01-14", // Tamil Thai Pongal Day
    "2026-02-04", // National Day
    "2026-04-13", // Day prior to Sinhala & Tamil New Year
    "2026-04-14", // Sinhala & Tamil New Year Day
    "2026-05-01", // May Day
    "2026-12-25", // Christmas Day
  ],
};

// 2. Acquirer T+2 settlement agreement
export const standardPolicy: SettlementPolicy = {
  id: "POL_ACQ_T2",
  version: "1.0.0",
  acquirerId: "ACQ_COMMERCIAL",
  currency: "LKR",
  effectiveFrom: "2026-01-01",
  cycleLength: 2,
  cycleUnit: "business_days",
  cutOffTime: "16:00:00",
  timeZone: "Asia/Colombo",
  calendarId: "CAL_LK_CENTRAL_BANK",
};`;

export default function CalendarsDocumentationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-trivio-border pb-6">
        <Badge variant="cyan">Financial Primitives</Badge>
        <h1 className="text-3xl font-extrabold text-trivio-warm">Settlement Calendars & Cycles</h1>
        <p className="text-sm text-gray-400">
          Forecasting exact deposit clearance dates with holiday and cut-off window adjustments.
        </p>
      </div>

      <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">Configuring Calendars</h2>
          <p className="text-xs text-gray-400 mb-3">
            Acquirers operate across diverse regional banking networks with unique holiday schedules:
          </p>
          <CodeBlock title="calendars.ts" code={calendarExample} />
        </div>

        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">Cut-Off Shift Logic</h2>
          <p className="text-xs text-gray-400">
            If a transaction occurs at 17:30 UTC when the acquirer cut-off is 16:00 UTC, the transaction is bundled into the subsequent banking day&apos;s batch before applying the T+N cycle shift.
          </p>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-trivio-border">
        <Button asChild variant="outline" size="sm">
          <Link href="/fees" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Fee Agreements
          </Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/timezones" className="gap-1.5">
            Timezones & Cut-Offs <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
