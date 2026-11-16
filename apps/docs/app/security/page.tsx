import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Security & PCI Boundaries — Trivio Docs",
  description: "Strict PCI DSS boundaries, zero secret storage, and local offline execution.",
};

export default function SecurityDocumentationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-border/80 pb-6">
        <Badge variant="default">Governance & Operations</Badge>
        <h1 className="text-3xl font-extrabold text-foreground">Security & PCI Boundaries</h1>
        <p className="text-sm text-muted-foreground">
          Strict isolation policies ensuring zero cardholder data exposure.
        </p>
      </div>

      <div className="space-y-6 text-sm text-muted-foreground leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-foreground mb-2">1. The Zero-PAN Cardinal Rule</h2>
          <p className="text-xs text-muted-foreground">
            Trivio generic calculation SDKs must <strong>never accept, process, log, or accept primary account numbers (PAN), CVVs, cardholder PINs, or banking credentials</strong>. All calculations operate purely on metadata: gross amounts, card schemes (<code className="text-foreground font-semibold font-mono">&apos;visa&apos;</code>, <code className="text-foreground font-semibold font-mono">&apos;mastercard&apos;</code>), card funding types (<code className="text-foreground font-semibold font-mono">&apos;credit&apos;</code>, <code className="text-foreground font-semibold font-mono">&apos;debit&apos;</code>), and issuance regions (<code className="text-foreground font-semibold font-mono">&apos;domestic&apos;</code>, <code className="text-foreground font-semibold font-mono">&apos;international&apos;</code>).
          </p>
        </div>

        <div>
          <h2 className="text-base font-bold text-foreground mb-2">2. Local Offline Execution</h2>
          <p className="text-xs text-muted-foreground">
            Unlike hosted payment analytics services that require sending transaction events across the public internet, Trivio calculations execute 100% locally in your server memory or browser thread. Zero telemetry, zero external network requests.
          </p>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-border/80">
        <Button asChild variant="outline" size="sm">
          <Link href="/errors" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Error Handling
          </Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/api-reference" className="gap-1.5">
            API Reference <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
