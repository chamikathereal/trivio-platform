import { Badge } from "@/components/ui/badge";
import { CodeBlock } from "@/components/code-block";
import { CheckCircle, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Trivio SDKs — Payment Settlement Intelligence",
  description:
    "Explore the three official Trivio SDK packages: @trivio.ink/core, @trivio.ink/node, and @trivio.ink/react.",
};

const coreCode = `import { 
  calculatePaymentSettlementEstimate, 
  estimateSettlementDate 
} from "@trivio.ink/core";

// 1. Calculate settlement estimate with MDR & fixed fee
const estimate = calculatePaymentSettlementEstimate({
  grossMinor: 500000n, // $5,000.00 in minor units
  feeRule: {
    percentageBps: 220, // 2.20%
    fixedFeeMinor: 30n,  // $0.30 fixed deduction
  },
  transactionTimeUtc: "2026-11-16T10:00:00Z",
});

console.log(estimate.netMinor); // 488970n ($4,889.70)
console.log(estimate.totalFeeMinor); // 11030n ($110.30)`;

const nodeCode = `import { TrivioClient } from "@trivio.ink/node";

// 2. Server-side configured client for backend services
const client = new TrivioClient({
  defaultFeeRule: {
    id: "RULE_STANDARD_MDR",
    percentageBps: 290, // 2.90%
    fixedFeeMinor: 30n,  // $0.30
  },
  defaultSettlementPolicy: {
    id: "POLICY_T_PLUS_1",
    cycleDays: 1,
    cutOffTimeUtc: "16:00",
    weekendHandling: "NEXT_BUSINESS_DAY",
  },
});

// Calculate and generate BigInt-safe serializable ledger record
const record = client.createLedgerRecord({
  transactionId: "txn_987654321",
  grossMinor: 100000n,
  transactionTimeUtc: new Date().toISOString(),
});

// Safe for JSON.stringify without BigInt TypeError
const jsonString = JSON.stringify(record);`;

const reactCode = `import React from "react";
import { TrivioSettlementSummary, TrivioFeeBreakdown } from "@trivio.ink/react";

export function PayoutDetails({ estimate }) {
  return (
    <div className="space-y-4">
      {/* High-level gross, fees, and net settlement summary */}
      <TrivioSettlementSummary estimate={estimate} currency="USD" />
      
      {/* Itemized fee table with percentage and fixed breakdowns */}
      <TrivioFeeBreakdown 
        grossMinor={estimate.grossMinor}
        percentageBps={250}
        fixedFeeMinor={1500n}
        currency="USD"
      />
    </div>
  );
}`;

export default function SDKsPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-16">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="cyan">Official Monorepo SDKs</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-trivio-warm">
          Modular SDK Architecture
        </h1>
        <p className="text-base text-gray-400 leading-relaxed">
          Trivio is designed with strict boundaries: mathematical calculations stay completely isolated in our zero-dependency core engine, while dedicated packages provide server-side client helpers and accessible React UI components.
        </p>
      </div>

      {/* Package 1: Core */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-trivio-border pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-trivio-warm">@trivio.ink/core</h2>
              <Badge variant="cyan">v0.1.0 Live</Badge>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Zero-dependency, zero-float settlement calculation primitives and calendar shift engines.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.npmjs.com/package/@trivio.ink/core"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-trivio-cyan hover:underline font-mono"
            >
              npm package <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-semibold text-trivio-warm">Key Characteristics:</h3>
            <ul className="text-xs space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Zero Runtime Dependencies:</strong> Eliminates supply-chain risks and vendor lock-in.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Zero-Float Math:</strong> Integer minor currency units with BigInt intermediate precision.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Calendar Forecasting:</strong> Supports T+1 to T+30, cut-off windows, weekends, and holidays.</span>
              </li>
            </ul>
            <div className="p-3 rounded-md border border-trivio-border bg-trivio-navy/60 font-mono text-xs text-gray-300">
              npm install @trivio.ink/core
            </div>
          </div>
          <div className="lg:col-span-7">
            <CodeBlock title="@trivio.ink/core usage" code={coreCode} />
          </div>
        </div>
      </div>

      {/* Package 2: Node */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-trivio-border pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-trivio-warm">@trivio.ink/node</h2>
              <Badge variant="cyan">v0.1.0 Live</Badge>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Backend client foundation for Node.js services, microservices, and financial ledgers.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.npmjs.com/package/@trivio.ink/node"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-trivio-cyan hover:underline font-mono"
            >
              npm package <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-semibold text-trivio-warm">Key Characteristics:</h3>
            <ul className="text-xs space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>TrivioClient:</strong> Configurable instance holding merchant fee rules and regional policies.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Crash-Free JSON Snapshots:</strong> Automatically serializes BigInt fields to string minor representations.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Framework-Decoupled:</strong> Works in Express, Fastify, NestJS, or serverless lambda functions.</span>
              </li>
            </ul>
            <div className="p-3 rounded-md border border-trivio-border bg-trivio-navy/60 font-mono text-xs text-gray-300">
              npm install @trivio.ink/node
            </div>
          </div>
          <div className="lg:col-span-7">
            <CodeBlock title="@trivio.ink/node usage" code={nodeCode} />
          </div>
        </div>
      </div>

      {/* Package 3: React */}
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-trivio-border pb-4">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-trivio-warm">@trivio.ink/react</h2>
              <Badge variant="cyan">v0.1.0 Live</Badge>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Accessible React components, monetary formatters, and settlement UI elements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <a
              href="https://www.npmjs.com/package/@trivio.ink/react"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs text-trivio-cyan hover:underline font-mono"
            >
              npm package <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-semibold text-trivio-warm">Key Characteristics:</h3>
            <ul className="text-xs space-y-2 text-gray-300">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Currency Exponent Safety:</strong> Correctly formats JPY (0 decimals), USD/EUR (2 decimals), and BHD (3 decimals).</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Ready-to-Use UI:</strong> Pre-built breakdown cards, timeline badges, and estimate summary trees.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span><strong>Design Token Integration:</strong> Uses Trivio&apos;s Midnight Navy and Electric Cyan theme tokens.</span>
              </li>
            </ul>
            <div className="p-3 rounded-md border border-trivio-border bg-trivio-navy/60 font-mono text-xs text-gray-300">
              npm install @trivio.ink/react
            </div>
          </div>
          <div className="lg:col-span-7">
            <CodeBlock title="@trivio.ink/react usage" code={reactCode} />
          </div>
        </div>
      </div>
    </div>
  );
}
