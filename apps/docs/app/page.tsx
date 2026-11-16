import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ArrowRight, ShieldCheck, Cpu, Layers, Server, Layout, Sparkles } from "lucide-react";

export default function DocsHomePage() {
  return (
    <div className="space-y-10">
      {/* Page Header */}
      <div className="space-y-3 border-b border-border/80 pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border/80 bg-background/80 backdrop-blur-md shadow-sm">
          <Sparkles className="w-3.5 h-3.5 text-foreground" />
          <span className="text-xs font-mono font-medium text-foreground tracking-wide uppercase">
            Official Developer Documentation
          </span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
          Settlement Intelligence{" "}
          <span className="font-serif italic font-normal text-muted-foreground">
            Architecture
          </span>
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
          Deterministic, type-safe calculation primitives and integration libraries modeling
          merchant discount rates (MDR), acquirer fees, scheme assessments, and settlement calendar
          adjustments with zero float math.
        </p>
      </div>

      {/* Quick Overview */}
      <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
        <h2 className="text-lg font-bold text-foreground">Core Mission: Developer-Owned Payment Data</h2>
        <p>
          Trivio is designed around a single cardinal rule: <strong className="text-foreground">Developer-Owned Payment Data</strong>. Calculations execute locally inside your infrastructure without mandatory cloud telemetry. Your transactional ledger stays in your database.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <Card className="border-border/80 bg-card/60 backdrop-blur-xl">
            <CardHeader className="p-5 space-y-1.5">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-foreground" />
                <CardTitle className="text-sm">Zero-Float Precision</CardTitle>
              </div>
              <CardDescription className="text-xs">
                Zero IEEE-754 floating point numbers in monetary math. All calculations use minor integer currency units and BigInt.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-border/80 bg-card/60 backdrop-blur-xl">
            <CardHeader className="p-5 space-y-1.5">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-foreground" />
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
      <div className="space-y-4 pt-4 border-t border-border/80">
        <h2 className="text-lg font-bold text-foreground">Monorepo SDK Packages</h2>
        <div className="space-y-3">
          <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-foreground/30">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl border border-border bg-foreground/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Layers className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-sm font-bold text-foreground">@trivio.ink/core</h3>
                  <Badge variant="default" className="text-[10px] font-mono">v0.1.0</Badge>
                  <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded border border-border/60">
                    Zero Dependencies
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                  Zero-dependency deterministic settlement calculations, MDR engines, and calendar shift primitives.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="flex-shrink-0">
              <Link href="/quickstart/core">Core Guide</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-foreground/30">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl border border-border bg-foreground/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Server className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-sm font-bold text-foreground">@trivio.ink/node</h3>
                  <Badge variant="default" className="text-[10px] font-mono">v0.1.0</Badge>
                  <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded border border-border/60">
                    Node.js 18+
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                  Configured client instances (<code className="font-mono text-foreground font-semibold">TrivioClient</code>) and BigInt-safe serializable ledger records for Node.js backends.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="flex-shrink-0">
              <Link href="/quickstart/node">Node Guide</Link>
            </Button>
          </div>

          <div className="rounded-2xl border border-border/80 bg-card/60 backdrop-blur-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all hover:border-foreground/30">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl border border-border bg-foreground/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Layout className="w-5 h-5 text-foreground" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-mono text-sm font-bold text-foreground">@trivio.ink/react</h3>
                  <Badge variant="default" className="text-[10px] font-mono">v0.1.0</Badge>
                  <span className="text-[10px] font-mono text-muted-foreground px-2 py-0.5 rounded border border-border/60">
                    React 18+
                  </span>
                </div>
                <p className="text-xs text-muted-foreground mt-1 max-w-xl">
                  React settlement summaries, itemized fee breakdown cards, timeline badges, and currency exponent-aware formatters.
                </p>
              </div>
            </div>
            <Button asChild size="sm" variant="outline" className="flex-shrink-0">
              <Link href="/quickstart/react">React Guide</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Next Steps CTA */}
      <div className="pt-6 flex justify-between items-center border-t border-border/80">
        <span className="text-xs text-muted-foreground font-mono">Next: Installation</span>
        <Button asChild variant="default" size="sm" className="rounded-full gap-1.5">
          <Link href="/installation">
            Install the SDKs <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
