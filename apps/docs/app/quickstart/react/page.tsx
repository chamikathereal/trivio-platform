import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "React SDK Quick Start — Trivio Docs",
  description: "Getting started with @trivio.ink/react components and hooks.",
};

const reactExample = `import React from "react";
import { 
  TrivioSettlementSummary, 
  TrivioFeeBreakdown,
  formatCurrency,
  formatMinorAmount,
  getCurrencyDecimals,
  type IntegratedSettlementEstimateResult
} from "@trivio.ink/react";

export function TransactionPayoutCard({ estimate }: { estimate: IntegratedSettlementEstimateResult }) {
  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-6 space-y-6">
      {/* 1. Complete settlement breakdown tree */}
      <TrivioSettlementSummary
        estimate={estimate}
        currencyCode="USD"
      />

      {/* 2. Itemized percentage and fixed fee breakdown */}
      <TrivioFeeBreakdown
        estimate={estimate}
        currencyCode="USD"
      />

      {/* 3. Direct currency formatting helper */}
      <p className="text-xs text-gray-400">
        Net deposit: {formatCurrency(estimate.netMinor, "USD")}
      </p>
    </div>
  );
};`;

export default function ReactQuickStartPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-trivio-border pb-6">
        <Badge variant="cyan">UI Components</Badge>
        <h1 className="text-3xl font-extrabold text-trivio-warm">@trivio.ink/react Quick Start</h1>
        <p className="text-sm text-gray-400">
          Ready-to-use React UI components, currency exponent formatters, and settlement summary trees.
        </p>
      </div>

      <div className="space-y-6 text-sm text-gray-300">
        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">Installation</h2>
          <CodeBlock language="bash" code="npm install @trivio.ink/react @trivio.ink/core react react-dom" />
        </div>

        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">Pre-Built Components</h2>
          <p className="text-xs text-gray-400 mb-3">
            Render accessible, currency-aware settlement summary cards in your frontend merchant portal:
          </p>
          <CodeBlock title="PayoutCard.tsx" code={reactExample} />
        </div>

        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">Currency Exponent Awareness</h2>
          <p className="text-xs text-gray-400 mb-2">
            The React SDK avoids naive <code className="text-gray-300 font-mono">/ 100</code> division by referencing the official ISO 4217 currency exponent table:
          </p>
          <div className="rounded-lg border border-trivio-border bg-trivio-navy/60 p-4 text-xs space-y-1 font-mono text-gray-300">
            <p>formatCurrency(1500, &apos;JPY&apos;) -&gt; &apos;JPY 1500&apos; (0 decimals via getCurrencyDecimals)</p>
            <p>formatCurrency(1000000, &apos;USD&apos;) -&gt; &apos;USD 10,000.00&apos; (2 decimals)</p>
            <p>formatCurrency(1500, &apos;BHD&apos;) -&gt; &apos;BHD 1.500&apos; (3 decimals)</p>
            <p>formatMinorAmount(1000000, 2) -&gt; &apos;10000.00&apos; (direct decimal string)</p>
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-trivio-border">
        <Button asChild variant="outline" size="sm">
          <Link href="/quickstart/node" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Node.js Quick Start
          </Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/fees" className="gap-1.5">
            Fee Agreements <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
