import { SettlementCalculator } from "@/components/calculator";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Interactive Settlement Calculator — Trivio",
  description:
    "Simulate merchant discount rates, acquirer fees, and calendar adjustments using Trivio's deterministic calculation engine.",
};

export default function CalculatorPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-14 max-w-5xl">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="heaven">Live Browser Calculation</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Settlement Intelligence Calculator
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          This interactive console executes directly against <code className="text-foreground font-mono font-semibold">@trivio.ink/core</code> locally in your browser. All monetary calculations preserve exact minor units using BigInt arithmetic without floating-point approximations.
        </p>
      </div>

      <SettlementCalculator />

      {/* Mathematical rules explanation */}
      <div className="max-w-4xl mx-auto rounded-2xl border border-border bg-card/60 backdrop-blur-xl p-8 space-y-5 text-xs text-muted-foreground">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-foreground">
          How the Trivio Settlement Engine Computes Payouts:
        </h3>
        <ol className="list-decimal pl-5 space-y-3 leading-relaxed">
          <li>
            <strong className="text-foreground">Minor Currency Unit Conversion:</strong> Inputs are converted to integer minor units (e.g., $500.00 becomes 50,000 minor units).
          </li>
          <li>
            <strong className="text-foreground">Deterministic Percentage MDR:</strong> Rates are evaluated in basis points (1 bps = 0.01%). The calculation computes <code className="font-mono text-foreground font-semibold">(grossMinor * bps + 5000n) / 10000n</code> with deterministic round-half-up division (<code className="font-mono text-foreground">roundHalfUpDiv</code>).
          </li>
          <li>
            <strong className="text-foreground">Fixed Deductions:</strong> Flat acquirer levies, batch processing charges, or wire fees are added directly in integer minor units.
          </li>
          <li>
            <strong className="text-foreground">Cut-Off & Calendar Forward-Shift:</strong> If the transaction timestamp exceeds the daily acquirer cut-off window (e.g. 16:00 UTC), the settlement cycle rolls forward to the subsequent business day. Weekends and registered bank holidays are automatically bypassed.
          </li>
        </ol>
      </div>
    </div>
  );
}
