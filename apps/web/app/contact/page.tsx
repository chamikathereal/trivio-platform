import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Github, Mail, Globe } from "lucide-react";

export const metadata = {
  title: "Contact & Community — Trivio",
  description:
    "Get in touch with the Trivio engineering team, report issues, and participate in open-source discussions.",
};

export default function ContactPage() {
  return (
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-16 space-y-12 max-w-4xl">
      <div className="text-center space-y-4">
        <Badge variant="cyan">Official Channels</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-trivio-warm">
          Contact & Community
        </h1>
        <p className="text-base text-gray-400 leading-relaxed max-w-xl mx-auto">
          We welcome collaboration, bug reports, feature requests, and inquiries from fintech developers and payment engineers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GitHub Issues */}
        <Card className="border-trivio-border bg-trivio-navy/60">
          <CardHeader className="space-y-2">
            <Github className="w-6 h-6 text-trivio-cyan" />
            <CardTitle className="text-lg text-trivio-warm">GitHub Repository</CardTitle>
            <CardDescription>
              For public bug reports, architectural questions, and code contributions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-400">
              Our engineering discussion and issue triage takes place publicly on GitHub:
            </p>
            <a
              href="https://github.com/trivio-ink/trivio-platform/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono text-trivio-cyan hover:underline"
            >
              github.com/trivio-ink/trivio-platform/issues
            </a>
          </CardContent>
        </Card>

        {/* Email Inquiries */}
        <Card className="border-trivio-border bg-trivio-navy/60">
          <CardHeader className="space-y-2">
            <Mail className="w-6 h-6 text-trivio-cyan" />
            <CardTitle className="text-lg text-trivio-warm">Direct Email Inquiries</CardTitle>
            <CardDescription>
              For general inquiries, security disclosures, and partnership discussions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-gray-400">
              Reach out directly to the Trivio maintainers:
            </p>
            <a
              href="mailto:support@trivio.ink"
              className="inline-flex items-center gap-2 text-xs font-mono text-trivio-cyan hover:underline"
            >
              support@trivio.ink
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Brand & Origin Card */}
      <Card className="border-trivio-border bg-trivio-midnight/80">
        <CardContent className="p-6 text-center space-y-2">
          <Globe className="w-5 h-5 text-gray-400 mx-auto" />
          <h3 className="text-sm font-semibold text-trivio-warm">Trivio Open Source Platform</h3>
          <p className="text-xs text-gray-500">
            Official Brand Domain: <span className="text-gray-300 font-mono">trivio.ink</span> • Located in Sri Lanka
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
