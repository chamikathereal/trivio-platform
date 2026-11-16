import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Zero-Float Monetary Precision — Trivio Docs",
  description: "Mandatory zero-float financial arithmetic, minor units, and deterministic round-half-up rounding.",
};

const precisionExample = `// ❌ Prohibited floating-point calculation:
// 10000.00 * 0.029 = 289.99999999999994 (Floating point drift!)

// ✅ Trivio deterministic integer calculation:
const grossMinor = 1000000n; // 10,000.00
const rateBps = 290n;        // 2.90%
const percentageFee = (grossMinor * rateBps + 5000n) / 10000n; // Exact Round-Half-Up division`;

export default function PrecisionDocumentationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-border/80 pb-6">
        <Badge variant="default">Financial Primitives</Badge>
        <h1 className="text-3xl font-extrabold text-foreground">Zero-Float Monetary Precision</h1>
        <p className="text-sm text-muted-foreground">
          Why Trivio enforces minor currency units and BigInt intermediate precision.
        </p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-foreground mb-2">The Danger of IEEE-754 Floats</h2>
          <p className="text-xs text-muted-foreground mb-3">
            In standard JavaScript and TypeScript, <code className="text-muted-foreground font-mono">0.1 + 0.2 === 0.30000000000000004</code>. In large-scale payment processing, accumulating fractional cent errors across millions of transactions leads to ledger imbalances and reconciliation failures.
          </p>
          <CodeBlock title="precision.ts" code={precisionExample} />
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground mb-2">Rounding Policy</h2>
          <p className="text-xs text-muted-foreground">
            Trivio implements <strong>Round-Half-Up (<code className="font-mono text-foreground font-semibold">roundHalfUpDiv</code>)</strong> as its core arithmetic rounding policy (<code className="font-mono text-foreground font-semibold">trivio-mdr-v1-half-up</code>), adding half the divisor (<code className="font-mono text-foreground font-semibold">5000n</code> for basis points divisor <code className="font-mono text-foreground font-semibold">10000n</code>) before integer division to guarantee deterministic commercial banking behavior without floating-point error.
          </p>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-border/80">
        <Button asChild variant="outline" size="sm">
          <Link href="/timezones" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Timezones & Cut-Offs
          </Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/errors" className="gap-1.5">
            Error Handling <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
