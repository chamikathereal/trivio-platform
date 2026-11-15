import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Node.js SDK Quick Start — Trivio Docs",
  description: "Getting started with @trivio.ink/node server-side client.",
};

const nodeExample = `import { TrivioClient } from "@trivio.ink/node";

// 1. Initialize client with pre-configured rules and policies
const client = new TrivioClient({
  feeRules: [
    {
      id: "RULE_MERCHANT_PRIMARY",
      version: "1.0.0",
      priority: 10,
      acquirerId: "ACQ_STRIPE",
      currency: "USD",
      effectiveFrom: "2026-01-01",
      rateSource: "merchant_configured",
      feeStructure: {
        rateBasisPoints: 290, // 2.90%
        fixedFeeMinor: 30,    // $0.30
      },
    },
  ],
  settlementPolicies: [
    {
      id: "POL_STANDARD_T2",
      version: "1.0.0",
      acquirerId: "ACQ_STRIPE",
      currency: "USD",
      effectiveFrom: "2026-01-01",
      cycleLength: 2,
      cycleUnit: "business_days",
      cutOffTime: "17:00:00",
      timeZone: "America/New_York",
      calendarId: "CAL_US_FED",
    },
  ],
  calendars: [
    {
      id: "CAL_US_FED",
      version: "2026.1",
      timeZone: "America/New_York",
      workingDays: [1, 2, 3, 4, 5],
      holidays: ["2026-12-25", "2027-01-01"],
    },
  ],
});

// 2. Compute settlement for an incoming payment transaction
const estimate = client.calculatePaymentSettlementEstimate({
  grossMinor: 10000, // $100.00
  currency: "USD",
  transactionTime: "2026-11-16T12:00:00Z",
  acquirerId: "ACQ_STRIPE",
});

console.log("Estimated Net:", estimate.netMinor); // 9680 ($96.80)`;

export default function NodeQuickStartPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-trivio-border pb-6">
        <Badge variant="cyan">Server SDK</Badge>
        <h1 className="text-3xl font-extrabold text-trivio-warm">@trivio.ink/node Quick Start</h1>
        <p className="text-sm text-gray-400">
          Server-side client management and crash-free JSON ledger records for backend services.
        </p>
      </div>

      <div className="space-y-6 text-sm text-gray-300">
        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">Installation</h2>
          <CodeBlock language="bash" code="npm install @trivio.ink/node @trivio.ink/core" />
        </div>

        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">Using TrivioClient</h2>
          <p className="text-xs text-gray-400 mb-3">
            In server environments, instantiate a singleton <code className="text-trivio-cyan font-mono">TrivioClient</code> with your pre-loaded fee rules and settlement policies:
          </p>
          <CodeBlock title="server-client.ts" code={nodeExample} />
        </div>

        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">Crash-Free BigInt JSON Serialization</h2>
          <p className="text-xs text-gray-400 mb-2">
            JavaScript standard <code className="text-gray-300 font-mono">JSON.stringify</code> throws a <code className="text-amber-400 font-mono">TypeError: Do not know how to serialize a BigInt</code> when encountering raw BigInt fields.
          </p>
          <p className="text-xs text-gray-400">
            The Node SDK includes built-in ledger snapshot serializers that convert integer minor units safely for database and API transmission without crashing.
          </p>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-trivio-border">
        <Button asChild variant="outline" size="sm">
          <Link href="/quickstart/core" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Core Quick Start
          </Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/quickstart/react" className="gap-1.5">
            React Quick Start <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
