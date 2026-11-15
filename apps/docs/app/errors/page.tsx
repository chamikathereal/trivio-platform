import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Error Handling & Invariants — Trivio Docs",
  description: "Type-safe error classes and boundary checks in Trivio SDKs.",
};

export default function ErrorsDocumentationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-trivio-border pb-6">
        <Badge variant="cyan">Financial Primitives</Badge>
        <h1 className="text-3xl font-extrabold text-trivio-warm">Error Handling & Invariants</h1>
        <p className="text-sm text-gray-400">
          Structured, deterministic error classes for invalid currency codes, negative amounts, and missing policies.
        </p>
      </div>

      <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">Trivio Error Hierarchy</h2>
          <div className="rounded-lg border border-trivio-border bg-trivio-navy/60 p-4 text-xs space-y-2 font-mono text-gray-300">
            <p><strong className="text-trivio-cyan">TrivioValidationError:</strong> Thrown when grossMinor is negative, currency code is invalid, or mandatory parameters are omitted.</p>
            <p><strong className="text-trivio-cyan">TrivioPolicyNotFoundError:</strong> Thrown when no settlement policy matches the transaction&apos;s acquirerId or currency.</p>
            <p><strong className="text-trivio-cyan">TrivioRuleNotFoundError:</strong> Thrown when no fee rule matches the transaction criteria.</p>
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-trivio-border">
        <Button asChild variant="outline" size="sm">
          <Link href="/precision" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Zero-Float Precision
          </Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/security" className="gap-1.5">
            Security & PCI <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
