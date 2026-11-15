import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CodeBlock } from "@/components/code-block";
import { ArrowRight, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "SDK Installation — Trivio Docs",
  description: "Learn how to install Trivio SDKs via npm in your application.",
};

export default function InstallationPage() {
  return (
    <div className="space-y-8">
      <div className="space-y-2 border-b border-trivio-border pb-6">
        <Badge variant="cyan">Getting Started</Badge>
        <h1 className="text-3xl font-extrabold text-trivio-warm">SDK Installation</h1>
        <p className="text-sm text-gray-400">
          All Trivio packages are published under the verified <code className="text-trivio-cyan font-mono">@trivio.ink</code> npm organization.
        </p>
      </div>

      <div className="space-y-6 text-sm text-gray-300">
        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">Package Manager Requirement</h2>
          <p className="text-xs text-gray-400 mb-3">
            Trivio officially supports <strong>npm</strong>. Ensure Node.js &gt;= 20.0.0 is installed.
          </p>
          <CodeBlock
            title="Check runtime environment"
            language="bash"
            code={`node -v  # Expected: v20.0.0 or higher\nnpm -v   # Expected: 10.0.0 or higher`}
          />
        </div>

        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">1. Core Engine Installation</h2>
          <p className="text-xs text-gray-400 mb-2">
            For pure calculation logic with zero runtime dependencies:
          </p>
          <CodeBlock
            title="Install @trivio.ink/core"
            language="bash"
            code={`npm install @trivio.ink/core`}
          />
        </div>

        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">2. Server-side Node.js Installation</h2>
          <p className="text-xs text-gray-400 mb-2">
            For backend microservices, ledger recording, and configured clients:
          </p>
          <CodeBlock
            title="Install @trivio.ink/node"
            language="bash"
            code={`npm install @trivio.ink/node @trivio.ink/core`}
          />
        </div>

        <div>
          <h2 className="text-base font-bold text-trivio-warm mb-2">3. React UI Components Installation</h2>
          <p className="text-xs text-gray-400 mb-2">
            For merchant portals, fee breakdown cards, and payout summary trees:
          </p>
          <CodeBlock
            title="Install @trivio.ink/react"
            language="bash"
            code={`npm install @trivio.ink/react @trivio.ink/core react react-dom`}
          />
        </div>
      </div>

      <div className="pt-6 flex justify-between items-center border-t border-trivio-border">
        <Button asChild variant="outline" size="sm">
          <Link href="/" className="gap-1.5">
            <ArrowLeft className="w-4 h-4" /> Introduction
          </Link>
        </Button>
        <Button asChild variant="default" size="sm">
          <Link href="/architecture" className="gap-1.5">
            Architecture <ArrowRight className="w-4 h-4" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
