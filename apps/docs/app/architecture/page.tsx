import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Architecture & Design Principles — Trivio Docs",
  description: "Monorepo separation, zero-float financial math, and decoupling standards.",
};

export default function ArchitecturePage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-border/80 pb-6">
        <Badge variant="default">System Architecture</Badge>
        <h1 className="text-3xl font-extrabold text-foreground">Architecture & Design Principles</h1>
        <p className="text-sm text-muted-foreground">
          The engineering policies governing Trivio&apos;s modular monorepo and financial integrity.
        </p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-lg font-bold text-foreground mb-2">1. Decoupled Monorepo Design</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Trivio maintains a strict separation of concerns across its workspaces:
          </p>
          <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-2">
            <li>
              <strong>Framework Independence:</strong> The calculation engines are strictly decoupled from web frameworks (NestJS, Next.js, Express) and persistence layers (Prisma, PostgreSQL).
            </li>
            <li>
              <strong>Zero Runtime Dependencies in Core:</strong> <code className="text-foreground font-semibold font-mono">@trivio.ink/core</code> contains exactly zero dependencies in its production manifest.
            </li>
            <li>
              <strong>Layered Ingestion:</strong> The React and Node packages import from Core; Core never depends on upper-level packages.
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-lg font-bold text-foreground mb-2">2. Zero-Float Arithmetic Pipeline</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Floating-point numbers (IEEE-754) introduce rounding drift in recurring fee calculations. Trivio enforces integer minor units:
          </p>
          <div className="rounded-lg border border-border/80 border-border/80 bg-card/60 backdrop-blur-xl p-4 font-mono text-xs text-muted-foreground space-y-1">
            <p className="text-emerald-400">// Correct Trivio representation:</p>
            <p>const grossMinor = 1000000n; // Exactly $10,000.00 in minor units</p>
            <p>const percentageFeeMinor = (grossMinor * 250n) / 10000n; // 25000n ($250.00)</p>
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold text-foreground mb-2">3. Historical Reproducibility & Ledgers</h2>
          <p className="text-xs text-muted-foreground">
            Payment disputes and tax audits often occur months or years after transaction clearance. Trivio fee calculations produce snapshot records capturing the exact rule version, effective date, and applied rate, guaranteeing immutable historical reproducibility.
          </p>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-border/80">
        <Button asChild variant="outline" size="sm">
          <Link href="/installation" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Installation
          </Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/quickstart/core" className="gap-1.5">
            Core Quick Start <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
