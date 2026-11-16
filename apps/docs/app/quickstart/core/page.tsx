import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Core SDK Quick Start — Trivio Docs",
  description: "Getting started with @trivio.ink/core calculation primitives.",
};

const example = `import { calculatePaymentSettlementEstimate } from "@trivio.ink/core";

// Execute consolidated calculation
const estimate = calculatePaymentSettlementEstimate(
  {
    grossMinor: 1000000, // $10,000.00
    currency: "USD",
    transactionTime: "2026-11-16T17:30:00Z",
    acquirerId: "ACQ_PRIMARY",
  },
  {
    feeRules: [
      {
        id: "RULE_VISA_CREDIT",
        version: "1.0.0",
        priority: 10,
        acquirerId: "ACQ_PRIMARY",
        currency: "USD",
        effectiveFrom: "2026-01-01",
        rateSource: "merchant_configured",
        feeStructure: {
          rateBasisPoints: 250, // 2.50% MDR
          fixedFeeMinor: 1500,  // $15.00 fixed
        },
      },
    ],
    settlementPolicies: [
      {
        id: "POLICY_T_PLUS_1",
        version: "1.0.0",
        acquirerId: "ACQ_PRIMARY",
        currency: "USD",
        effectiveFrom: "2026-01-01",
        cycleLength: 1,
        cycleUnit: "business_days",
        cutOffTime: "16:00:00",
        timeZone: "UTC",
        calendarId: "CAL_US",
      },
    ],
    calendars: [
      {
        id: "CAL_US",
        version: "2026.1",
        timeZone: "UTC",
        workingDays: [1, 2, 3, 4, 5],
        holidays: ["2026-12-25", "2027-01-01"],
      },
    ],
  }
);

console.log("Net Settlement:", estimate.netMinor); // 973500 ($9,735.00)
console.log("Settlement Date:", estimate.expectedSettlementDate); // "2026-11-18"
console.log("Cut-off Shifted:", estimate.isPastCutOff); // true (17:30 > 16:00)`;

export default function CoreQuickStartPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-border/80 pb-6">
        <Badge variant="default">Core Engine</Badge>
        <h1 className="text-3xl font-extrabold text-foreground">@trivio.ink/core Quick Start</h1>
        <p className="text-sm text-muted-foreground">
          Pure calculation primitives for fee deduction and settlement date estimation.
        </p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground">
        <div>
          <h2 className="text-base font-bold text-foreground mb-2">Installation</h2>
          <CodeBlock language="bash" code="npm install @trivio.ink/core" />
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground mb-2">Unified Calculation API</h2>
          <p className="text-xs text-muted-foreground mb-3">
            The <code className="text-foreground font-semibold font-mono">calculatePaymentSettlementEstimate</code> function combines MDR percentage calculations, fixed acquirer levies, and settlement calendar adjustments into a single deterministic call:
          </p>
          <CodeBlock title="unified-estimate.ts" code={example} />
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground mb-2">Key Return Properties</h2>
          <div className="rounded-lg border border-border/80 border-border/80 bg-card/60 backdrop-blur-xl p-4 text-xs space-y-2">
            <p><strong>grossMinor:</strong> Exact integer gross authorized minor units.</p>
            <p><strong>percentageFeeMinor:</strong> Computed percentage MDR deduction.</p>
            <p><strong>fixedFeeMinor:</strong> Fixed per-transaction charge.</p>
            <p><strong>totalFeeMinor:</strong> Combined sum of percentage and fixed fees.</p>
            <p><strong>netMinor:</strong> Final estimated deposit credit (<code className="text-foreground font-semibold font-mono">grossMinor - totalFeeMinor</code>).</p>
            <p><strong>expectedSettlementDate:</strong> Projected bank deposit clearance date (ISO format <code className="text-foreground font-semibold font-mono">YYYY-MM-DD</code>).</p>
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-border/80">
        <Button asChild variant="outline" size="sm">
          <Link href="/architecture" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Architecture
          </Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/quickstart/node" className="gap-1.5">
            Node.js Quick Start <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
