import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Lock, Server, BarChart3, Database, ShieldAlert, Sparkles } from "lucide-react";

export const metadata = {
  title: "Trivio Cloud — Future Architecture Roadmap",
  description:
    "Preview the planned capabilities for Trivio Cloud: multi-tenant settlement dashboards, automated reconciliation microservices, and hosted APIs.",
};

export default function CloudPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-16 max-w-4xl">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs text-amber-400 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Stage 4B & 4C Planned Capabilities</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-trivio-warm">
          Trivio Cloud Architecture
        </h1>
        <p className="text-base text-gray-400 leading-relaxed max-w-2xl mx-auto">
          While our calculation SDKs are live and open-source today, Trivio Cloud represents our upcoming hosted platform for automated acquirer batch reconciliation, merchant analytics, and cloud API access.
        </p>
      </div>

      {/* Notice Banner */}
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-4 text-xs text-amber-300 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 flex-shrink-0 text-amber-400 mt-0.5" />
        <div>
          <strong className="font-semibold">Future Architecture Transparency:</strong> The features described on this page represent planned commercial capabilities scheduled for subsequent milestones (Stage 4B and 4C). No paid subscriptions, cloud databases, or hosted APIs are currently active in Stage 4A.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-trivio-border bg-trivio-navy/60">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <Server className="w-5 h-5 text-trivio-cyan" />
              <Badge variant="amber">Coming in Stage 4C</Badge>
            </div>
            <CardTitle className="text-base text-trivio-warm">Hosted Settlement API</CardTitle>
            <CardDescription>
              A high-throughput, low-latency microservice exposing settlement forecasting endpoints for non-Node.js systems (Go, Python, Java, Ruby).
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
              <li>REST and gRPC calculation endpoints</li>
              <li>Global multi-region edge deployment</li>
              <li>Pre-loaded global holiday calendars for 80+ nations</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-trivio-border bg-trivio-navy/60">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <BarChart3 className="w-5 h-5 text-trivio-cyan" />
              <Badge variant="amber">Coming in Stage 4B</Badge>
            </div>
            <CardTitle className="text-base text-trivio-warm">Merchant Console & Dashboard</CardTitle>
            <CardDescription>
              A web console for payment operations teams to manage fee rule tiers, model contract renegotiations, and visualize settlement cash-flow.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
              <li>Visual fee schedule builder</li>
              <li>Cash-flow forecasting calendar</li>
              <li>Multi-merchant hierarchical configuration</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-trivio-border bg-trivio-navy/60">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <Database className="w-5 h-5 text-trivio-cyan" />
              <Badge variant="amber">Planned</Badge>
            </div>
            <CardTitle className="text-base text-trivio-warm">Acquirer Batch Reconciliation</CardTitle>
            <CardDescription>
              Automatic parser and reconciler for credit batch settlement files (EPA, raw CSV, ISO 20022 camt.053) against estimated deductions.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
              <li>Discrepancy detection between estimated and confirmed fees</li>
              <li>Interchange fee and scheme assessment audit</li>
              <li>Automated dispute package generation</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="border-trivio-border bg-trivio-navy/60">
          <CardHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <Lock className="w-5 h-5 text-trivio-cyan" />
              <Badge variant="cyan">Uncompromised Standard</Badge>
            </div>
            <CardTitle className="text-base text-trivio-warm">Strict PCI & Privacy Guardrails</CardTitle>
            <CardDescription>
              Trivio Cloud will never store or process primary account numbers (PAN), CVVs, or cardholder PINs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-4">
              <li>Operates solely on anonymized transaction metadata</li>
              <li>Zero raw cardholder data boundary</li>
              <li>End-to-end encrypted tenant isolation</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
