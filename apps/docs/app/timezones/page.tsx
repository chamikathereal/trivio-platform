import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Timezones & Cut-Off Windows — Trivio Docs",
  description: "Handling global clearing house timezones and daily batch cut-off windows.",
};

export default function TimezonesDocumentationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-border/80 pb-6">
        <Badge variant="default">Financial Primitives</Badge>
        <h1 className="text-3xl font-extrabold text-foreground">Timezones & Cut-Off Windows</h1>
        <p className="text-sm text-muted-foreground">
          How Trivio handles IANA timezones, UTC transactions, and local banking batch windows.
        </p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-foreground mb-2">IANA Timezone Resolution</h2>
          <p className="text-xs text-muted-foreground mb-2">
            Payment transactions occur in UTC, while bank clearing houses operate on local timezones (e.g. <code className="text-foreground font-semibold font-mono">Asia/Colombo</code>, <code className="text-foreground font-semibold font-mono">America/New_York</code>, <code className="text-foreground font-semibold font-mono">Europe/London</code>).
          </p>
          <p className="text-xs text-muted-foreground">
            Trivio converts UTC transaction timestamps to the policy&apos;s specified IANA timezone before evaluating whether the transaction falls before or after the daily cut-off window.
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground mb-2">Cut-Off Shift Example</h2>
          <div className="rounded-lg border border-border/80 border-border/80 bg-card/60 backdrop-blur-xl p-4 text-xs space-y-2 font-mono text-muted-foreground">
            <p>Cut-Off Time: 16:00:00 Asia/Colombo</p>
            <p>Transaction: Friday 2026-11-13 17:30:00 Asia/Colombo (Past Cut-Off)</p>
            <p className="text-amber-400">Batch Assignment: Shifted to Monday 2026-11-16 batch</p>
            <p className="text-emerald-400">T+1 Settlement Clearance: Tuesday 2026-11-17</p>
          </div>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-border/80">
        <Button asChild variant="outline" size="sm">
          <Link href="/calendars" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Calendars & Cycles
          </Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/precision" className="gap-1.5">
            Zero-Float Precision <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
