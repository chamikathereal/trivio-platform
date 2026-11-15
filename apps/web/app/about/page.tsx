import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldCheck, Lock } from "lucide-react";

export const metadata = {
  title: "About Trivio — Payment Settlement Intelligence",
  description:
    "Learn about Trivio's mission, developer-first philosophy, open-source model, and deterministic financial calculations.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-16 max-w-4xl">
      <div className="text-center space-y-4">
        <Badge variant="cyan">Company & Philosophy</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-trivio-warm">
          About Trivio
        </h1>
        <p className="text-base text-gray-400 leading-relaxed">
          Trivio is a developer-first payment settlement intelligence platform designed to eliminate financial ambiguity and reconciliation discrepancies.
        </p>
      </div>

      <div className="space-y-8 text-sm text-gray-300 leading-relaxed">
        <Card className="border-trivio-border bg-trivio-navy/60">
          <CardHeader>
            <CardTitle className="text-lg text-trivio-warm">Our Core Mission</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              In payment operations, calculating merchant discount rates (MDR), scheme assessments, and settlement clearance dates is often fraught with subtle errors. Acquirers use complex cut-off windows, regional banking holidays, and dynamic tiered rate agreements. When software systems rely on imprecise floating-point numbers or hardcoded calendar assumptions, reconciliation breaks down.
            </p>
            <p>
              Trivio provides deterministic, type-safe calculation primitives and SDKs that model every component of the payment settlement lifecycle with mathematical certainty.
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-trivio-border bg-trivio-navy/60">
            <CardHeader className="space-y-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
              <CardTitle className="text-base">Developer-Owned Payment Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400 leading-relaxed">
                Developers own and store their transactional ledgers inside their own databases. Trivio core libraries execute locally inside your infrastructure without mandatory cloud telemetry. Calculations work offline with zero external network dependencies.
              </p>
            </CardContent>
          </Card>

          <Card className="border-trivio-border bg-trivio-navy/60">
            <CardHeader className="space-y-2">
              <Lock className="w-6 h-6 text-trivio-cyan" />
              <CardTitle className="text-base">Zero-Float Financial Math</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-gray-400 leading-relaxed">
                We strictly reject IEEE-754 floating-point operations (<code className="text-trivio-cyan">0.1 + 0.2</code>). All financial figures are represented in integer minor currency units with BigInt intermediate precision and documented rounding policies.
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="border-trivio-border bg-trivio-navy/60">
          <CardHeader>
            <CardTitle className="text-lg text-trivio-warm">Open-Source & Cloud Boundaries</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>
              Trivio maintains a clear boundary between our open-source tools and our upcoming hosted cloud services:
            </p>
            <ul className="list-disc pl-5 space-y-2 text-xs text-gray-400">
              <li>
                <strong>Open-Source SDKs (Apache-2.0):</strong> <code className="text-trivio-cyan">@trivio.ink/core</code>, <code className="text-trivio-cyan">@trivio.ink/node</code>, and <code className="text-trivio-cyan">@trivio.ink/react</code> are published under the permissive Apache-2.0 license. Anyone can use, inspect, embed, or contribute to them freely.
              </li>
              <li>
                <strong>Upcoming Hosted Cloud Platform (Proprietary):</strong> Optional cloud-hosted multi-tenant merchant portals, reconciliation microservices, and automated acquirer file parsers will be provided as separate managed services in future stages.
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Brand Origin */}
        <div className="rounded-lg border border-trivio-border/60 bg-trivio-midnight/70 p-6 text-center space-y-2">
          <h4 className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Trivio Brand Identity</h4>
          <p className="text-lg font-bold text-trivio-warm">Trusted • Timeless • Transparent</p>
          <p className="text-xs text-gray-500">Established 2026 • Located in Sri Lanka • trivio.ink</p>
        </div>
      </div>
    </div>
  );
}
