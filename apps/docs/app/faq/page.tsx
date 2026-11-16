import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "FAQ & Known Limitations — Trivio Docs",
  description: "Frequently asked questions and technical boundaries for Trivio SDKs.",
};

export default function FAQDocumentationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-border/80 pb-6">
        <Badge variant="default">FAQ</Badge>
        <h1 className="text-3xl font-extrabold text-foreground">FAQ & Known Limitations</h1>
        <p className="text-sm text-muted-foreground">
          Frequently asked questions regarding calculation models and operational boundaries.
        </p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-foreground mb-1">Are Trivio calculations estimates or confirmed bank settlements?</h2>
          <p className="text-xs text-muted-foreground">
            Calculations performed at authorization time are <strong>deterministic estimates</strong> based on your configured merchant agreement. Actual settlement credits may occasionally vary due to acquirer fee adjustments, interchange plus changes, or disputed chargebacks.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground mb-1">Does Trivio transmit transaction data to any remote server?</h2>
          <p className="text-xs text-muted-foreground">
            No. The core calculation engines execute 100% locally in your runtime thread. No telemetry, analytics, or logging data leaves your environment.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground mb-1">Does Trivio require Node.js 20+?</h2>
          <p className="text-xs text-muted-foreground">
            Yes. Trivio targets modern ECMAScript standards with native BigInt math and structured cloning.
          </p>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-border/80">
        <Button asChild variant="outline" size="sm">
          <Link href="/licensing" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Apache-2.0 Licensing
          </Link>
        </Button>
      </div>
    </div>
  );
}
