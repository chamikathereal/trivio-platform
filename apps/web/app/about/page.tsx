import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { ShieldCheck, Lock, Database, Calendar } from "lucide-react";

export const metadata = {
  title: "About Trivio — The Agent of Heaven for Settlement Intelligence",
  description:
    "Learn about Trivio's mission: saving developers from the purgatory of complex financial calculations with deterministic zero-float math and offline execution.",
};

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-16 max-w-4xl">
      {/* Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <Badge variant="heaven">Our Divine Mission</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          The Agent of Heaven for Payment Engineers
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Trivio is engineered to save developers from the purgatory of complex financial calculations, IEEE-754 floating-point drift, and hidden bank fee drift.
        </p>
      </div>

      {/* Visual Feature: Celestial Guardian */}
      <div className="relative w-full h-64 sm:h-96 rounded-3xl overflow-hidden border border-border shadow-xl">
        <Image
          src="/celestial-guardian.jpg"
          alt="Trivio Celestial Guardian"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent pointer-events-none" />
        <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-foreground">
          <div>
            <div className="text-xs uppercase tracking-wider font-semibold text-muted-foreground">
              Guardian of Settlement Accuracy
            </div>
            <div className="text-lg font-bold">
              Deterministic. Offline. Uncompromising.
            </div>
          </div>
          <Badge variant="heaven" className="hidden sm:inline-flex">
            Trivio Engine v0.1.0
          </Badge>
        </div>
      </div>

      {/* Manifesto Content */}
      <div className="space-y-8 text-sm text-foreground/90 leading-relaxed">
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">The Purgatory of Payment Reconciliation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground leading-relaxed">
            <p>
              In payment operations, calculating merchant discount rates (MDR), acquirer charges, scheme assessments, and settlement clearance dates is often fraught with subtle errors. Acquirers use complex cut-off windows, regional banking holidays, and dynamic tiered rate agreements. When software systems rely on imprecise floating-point numbers or hardcoded calendar assumptions, reconciliation breaks down.
            </p>
            <p>
              A one-cent rounding drift repeated over hundreds of thousands of transactions causes significant financial discrepancies between internal ledgers and bank deposit summaries. This creates a reconciliation nightmare that wastes thousands of engineering hours.
            </p>
            <p className="text-foreground font-medium">
              Trivio exists to bring mathematical clarity. We provide deterministic, type-safe calculation primitives and integration libraries that model every facet of the payment settlement lifecycle with absolute precision.
            </p>
          </CardContent>
        </Card>

        {/* Core Tenets Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground">
                <Database className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Developer-Owned Payment Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Developers own and store their transactional ledgers inside their own databases. Trivio core libraries execute locally inside your infrastructure without mandatory cloud telemetry. Calculations work offline with zero external network dependencies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground">
                <Lock className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Zero-Float Financial Math</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                We strictly reject IEEE-754 floating-point operations (<code className="font-mono text-foreground">0.1 + 0.2</code>). All financial figures are represented in integer minor currency units with BigInt intermediate precision and documented rounding policies.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground">
                <Calendar className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Holiday & Cut-Off Awareness</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Never assume simple T+1 settlement cycles. Trivio incorporates daily bank cut-off times, weekend shifts, and regional public holidays to forecast exact settlement dates with deterministic certainty.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-2">
              <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <CardTitle className="text-base">Zero Raw Cardholder Data</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Trivio libraries never accept, process, store, or transmit primary account numbers (PAN), CVVs, or cardholder credentials. We model business logic, fee agreements, and settlement timelines only.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
