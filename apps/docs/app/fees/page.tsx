import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Fee Agreements & Dynamic Rules — Trivio Docs",
  description: "Configure percentage MDR, fixed fees, and dynamic tiered matching rules.",
};

const feeRuleExample = `import { MerchantFeeRule } from "@trivio.ink/core";

// High-priority international card rule with flat fee
const internationalRule: MerchantFeeRule = {
  id: "RULE_VISA_INTL_TIER_1",
  version: "1.2.0",
  priority: 100, // Higher priority matches first
  acquirerId: "ACQ_BOC",
  currency: "LKR",
  cardScheme: "visa",
  cardRegion: "international",
  cardFundingType: "credit",
  effectiveFrom: "2026-01-01",
  rateSource: "merchant_configured",
  feeStructure: {
    rateBasisPoints: 350, // 3.50% MDR
    fixedFeeMinor: 2500,  // 25.00 LKR fixed fee
  },
};`;

export default function FeesDocumentationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-border/80 pb-6">
        <Badge variant="default">Financial Primitives</Badge>
        <h1 className="text-3xl font-extrabold text-foreground">Fee Agreements & Dynamic Rules</h1>
        <p className="text-sm text-muted-foreground">
          How Trivio models merchant discount rates (MDR), scheme assessments, and hierarchical rule evaluation.
        </p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-foreground mb-2">MerchantFeeRule Data Contract</h2>
          <p className="text-xs text-muted-foreground mb-3">
            Every merchant discount agreement is modeled as an immutable rule with explicit priority matching:
          </p>
          <CodeBlock title="fee-rule.ts" code={feeRuleExample} />
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground mb-2">Priority Resolution & Specificity</h2>
          <p className="text-xs text-muted-foreground mb-2">
            When multiple fee rules match an incoming transaction, the rule with the highest numerical <code className="text-foreground font-semibold font-mono">priority</code> is applied.
          </p>
          <ul className="list-disc pl-5 text-xs text-muted-foreground space-y-1.5">
            <li>Terminal-specific rules override merchant-wide rules.</li>
            <li>International card rules override domestic blended rules.</li>
            <li>Credit card rules override debit card rules.</li>
          </ul>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-border/80">
        <Button asChild variant="outline" size="sm">
          <Link href="/quickstart/react" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> React Quick Start
          </Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/calendars" className="gap-1.5">
            Calendars & Cycles <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
