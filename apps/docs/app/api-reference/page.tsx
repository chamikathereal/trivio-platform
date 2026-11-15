import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "API Reference & TypeScript Types — Trivio Docs",
  description: "Complete export and type declaration reference for Trivio SDKs.",
};

export default function ApiReferencePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-trivio-border pb-6">
        <Badge variant="cyan">Reference</Badge>
        <h1 className="text-3xl font-extrabold text-trivio-warm">API Reference & Types</h1>
        <p className="text-sm text-gray-400">
          Public TypeScript interfaces and methods exported across all three packages.
        </p>
      </div>

      <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2 font-mono">@trivio.ink/core</h2>
          <div className="rounded-lg border border-trivio-border bg-trivio-navy/60 p-4 text-xs space-y-2 font-mono text-gray-300">
            <p><strong className="text-trivio-cyan">calculatePaymentSettlementEstimate(transaction, config, options?):</strong> Consolidated fee and calendar calculation.</p>
            <p><strong className="text-trivio-cyan">calculateFeeEstimate(transaction, rules):</strong> Dynamic MDR fee evaluation.</p>
            <p><strong className="text-trivio-cyan">estimateSettlementDate(input, policies, calendars):</strong> Calendar clearance date calculation.</p>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2 font-mono">@trivio.ink/node</h2>
          <div className="rounded-lg border border-trivio-border bg-trivio-navy/60 p-4 text-xs space-y-2 font-mono text-gray-300">
            <p><strong className="text-trivio-cyan">new TrivioClient(config):</strong> Server-side configured instance.</p>
            <p><strong className="text-trivio-cyan">client.calculateSettlement(transaction):</strong> Run estimation through configured instance.</p>
            <p><strong className="text-trivio-cyan">client.createLedgerRecord(transaction):</strong> Produce BigInt-safe serializable snapshot.</p>
          </div>
        </div>

        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2 font-mono">@trivio.ink/react</h2>
          <div className="rounded-lg border border-trivio-border bg-trivio-navy/60 p-4 text-xs space-y-2 font-mono text-gray-300">
            <p><strong className="text-trivio-cyan">&lt;TrivioSettlementSummary /&gt;:</strong> Complete high-level settlement breakdown tree.</p>
            <p><strong className="text-trivio-cyan">&lt;TrivioFeeBreakdown /&gt;:</strong> Itemized fee calculation card.</p>
            <p><strong className="text-trivio-cyan">&lt;TrivioSettlementTimeline /&gt;:</strong> Deposit clearance timeline badge.</p>
            <p><strong className="text-trivio-cyan">formatMinorAmount(minor, currency):</strong> ISO 4217 exponent-aware formatter.</p>
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-trivio-border">
        <Button asChild variant="outline" size="sm">
          <Link href="/security" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Security & PCI
          </Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/licensing" className="gap-1.5">
            Apache-2.0 Licensing <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
