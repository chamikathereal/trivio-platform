import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, Cpu } from "lucide-react";

export default function DocsHomePage() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="space-y-2 border-b border-trivio-border pb-6">
        <Badge variant="cyan">Official Documentation</Badge>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-trivio-warm">
          Trivio Developer Documentation
        </h1>
        <p className="text-sm text-gray-400 leading-relaxed max-w-2xl">
          Deterministic, type-safe calculation primitives and integration libraries modeling merchant discount rates (MDR), acquirer fees, scheme assessments, and settlement calendar adjustments.
        </p>
      </div>

      {/* Quick Overview */}
      <div className="space-y-4 text-sm text-gray-300 leading-relaxed">
        <h2 className="text-lg font-bold text-trivio-warm">Core Engineering Mission</h2>
        <p>
          Trivio is designed around a single cardinal rule: <strong>Developer-Owned Payment Data</strong>. Calculations execute locally inside your infrastructure without mandatory cloud telemetry. Your transactional ledger stays in your database.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Card className="border-trivio-border bg-trivio-navy/60">
            <CardHeader className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-trivio-cyan" />
                <CardTitle className="text-sm">Zero-Float Precision</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Zero IEEE-754 floating point numbers in monetary math. All calculations use minor integer currency units and BigInt.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-trivio-border bg-trivio-navy/60">
            <CardHeader className="p-4 space-y-1">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <CardTitle className="text-sm">PCI Boundary Safety</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Trivio SDKs never accept, process, log, or store raw cardholder PANs, CVVs, or cardholder PINs.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>

      {/* Available Packages */}
      <div className="space-y-4 pt-4 border-t border-trivio-border">
        <h2 className="text-lg font-bold text-trivio-warm">Monorepo SDK Packages</h2>
        <div className="space-y-3">
          <div className="rounded-lg border border-trivio-border bg-trivio-navy/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold text-trivio-cyan">@trivio.ink/core</h3>
                <Badge variant="cyan" className="text-[10px]">v0.1.0</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Zero-dependency deterministic settlement calculations, MDR engines, and calendar shift primitives.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/quickstart/core">Core Guide</Link>
            </Button>
          </div>

          <div className="rounded-lg border border-trivio-border bg-trivio-navy/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold text-trivio-cyan">@trivio.ink/node</h3>
                <Badge variant="cyan" className="text-[10px]">v0.1.0</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Configured client instances (<code className="text-gray-300">TrivioClient</code>) and BigInt-safe serializable ledger records for Node.js backends.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/quickstart/node">Node Guide</Link>
            </Button>
          </div>

          <div className="rounded-lg border border-trivio-border bg-trivio-navy/40 p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-mono text-sm font-bold text-trivio-cyan">@trivio.ink/react</h3>
                <Badge variant="cyan" className="text-[10px]">v0.1.0</Badge>
              </div>
              <p className="text-xs text-gray-400 mt-1">
                React settlement summaries, itemized fee breakdown cards, timeline badges, and currency exponent-aware formatters.
              </p>
            </div>
            <Button asChild size="sm" variant="outline">
              <Link href="/quickstart/react">React Guide</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Next Steps CTA */}
      <div className="pt-6 flex justify-between items-center border-t border-trivio-border">
        <span className="text-xs text-gray-500 font-mono">Next: Installation</span>
        <Button asChild variant="default" size="sm">
          <Link href="/installation" className="gap-1.5">
            Install the SDKs <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
