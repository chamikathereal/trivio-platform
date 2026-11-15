import { SettlementCalculator } from "@/components/calculator";
import { Badge } from "@/components/ui/badge";

export const metadata = {
  title: "Interactive Settlement Calculator — Trivio",
  description:
    "Simulate merchant discount rates, acquirer fees, and calendar adjustments using Trivio's deterministic calculation engine.",
};

export default function CalculatorPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <Badge variant="cyan">Real-time Calculation</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-trivio-warm">
          Settlement Intelligence Calculator
        </h1>
        <p className="text-base text-gray-400 leading-relaxed">
          This interactive tool executes directly against <code className="text-trivio-cyan font-mono">@trivio.ink/core</code> in your browser. All monetary math uses BigInt integer precision without floating-point approximations.
        </p>
      </div>

      <SettlementCalculator />

      {/* Mathematical rules explanation */}
      <div className="max-w-4xl mx-auto rounded-lg border border-trivio-border bg-trivio-navy/60 p-6 space-y-4 text-xs text-gray-300">
        <h3 className="text-sm font-semibold text-trivio-warm">How the Trivio Engine Evaluates Settlement:</h3>
        <ol className="list-decimal pl-5 space-y-2 leading-relaxed">
          <li>
            <strong>Minor Unit Conversion:</strong> Amounts are converted to integer minor units (e.g., $10,000.00 becomes 1,000,000 minor units).
          </li>
          <li>
            <strong>Percentage Fee Calculation:</strong> Percentage rate is expressed in basis points (1 bps = 0.01%). The calculation performs <code className="font-mono text-trivio-cyan">(grossMinor * bps + 5000n) / 10000n</code> with deterministic round-half-up division (<code className="font-mono text-trivio-cyan">roundHalfUpDiv</code>).
          </li>
          <li>
            <strong>Fixed Deductions:</strong> Flat acquirer levies or wire charges are added directly to the percentage deduction.
          </li>
          <li>
            <strong>Cut-Off & Calendar Shift:</strong> If the transaction timestamp is after the daily cut-off time (e.g. 16:00 UTC), the settlement cycle begins on the next business day. Weekends and registered bank holidays are automatically skipped.
          </li>
        </ol>
      </div>
    </div>
  );
}
