import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Apache-2.0 Licensing — Trivio Docs",
  description: "Open-source licensing terms, trademarks, and cloud boundaries.",
};

export default function LicensingDocumentationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-trivio-border pb-6">
        <Badge variant="cyan">Open Source License</Badge>
        <h1 className="text-3xl font-extrabold text-trivio-warm">Apache-2.0 Licensing</h1>
        <p className="text-sm text-gray-400">
          The legal framework governing Trivio SDK distribution and proprietary boundaries.
        </p>
      </div>

      <div className="space-y-6 text-sm text-gray-300 leading-relaxed">
        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">Permissive Open-Source Scope</h2>
          <p className="text-xs text-gray-400 mb-2">
            The three calculation SDK packages (<code className="text-trivio-cyan font-mono">@trivio.ink/core</code>, <code className="text-trivio-cyan font-mono">@trivio.ink/node</code>, and <code className="text-trivio-cyan font-mono">@trivio.ink/react</code>) are licensed under the <strong>Apache License, Version 2.0</strong>.
          </p>
          <ul className="list-disc pl-5 text-xs text-gray-400 space-y-1.5">
            <li>You may freely embed, run, and modify Trivio SDKs in commercial or open-source products.</li>
            <li>No mandatory paid license or subscription is required to use the open-source SDKs.</li>
            <li>Each package contains standalone LICENSE and NOTICE files.</li>
          </ul>
        </div>

        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">Reserved Commercial Trademarks & Services</h2>
          <p className="text-xs text-gray-400">
            The Apache-2.0 license grants software copyright permissions, but does not grant rights to Trivio trademarks, brand logos (<code className="text-trivio-cyan font-mono">trivio.ink</code>), or upcoming hosted proprietary cloud microservices (<code className="text-gray-300 font-mono">apps/api</code>, <code className="text-gray-300 font-mono">apps/console</code>).
          </p>
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-trivio-border">
        <Button asChild variant="outline" size="sm">
          <Link href="/api-reference" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> API Reference
          </Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/faq" className="gap-1.5">
            FAQ & Limitations <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
