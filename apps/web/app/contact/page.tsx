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
    <div className="container mx-auto px-4 sm:px-6 py-12 md:py-20 space-y-12 max-w-4xl">
      <div className="text-center space-y-4">
        <Badge variant="heaven">Official Channels</Badge>
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-foreground">
          Contact & Community
        </h1>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-xl mx-auto">
          We welcome collaboration, bug reports, feature requests, and inquiries from fintech developers and payment engineers.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* GitHub Issues */}
        <Card>
          <CardHeader className="space-y-2">
            <Github className="w-6 h-6 text-foreground" />
            <CardTitle className="text-lg">GitHub Repository</CardTitle>
            <CardDescription>
              For public bug reports, architectural questions, and code contributions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Our engineering discussion and issue triage takes place publicly on GitHub:
            </p>
            <a
              href="https://github.com/trivio-ink/trivio-platform/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs font-mono text-foreground hover:underline"
            >
              github.com/trivio-ink/trivio-platform/issues
            </a>
          </CardContent>
        </Card>

        {/* Email Inquiries */}
        <Card>
          <CardHeader className="space-y-2">
            <Mail className="w-6 h-6 text-foreground" />
            <CardTitle className="text-lg">Direct Email Inquiries</CardTitle>
            <CardDescription>
              For general inquiries, security disclosures, and partnership discussions.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-xs text-muted-foreground">
              Reach out directly to the Trivio maintainers:
            </p>
            <a
              href="mailto:support@trivio.ink"
              className="inline-flex items-center gap-2 text-xs font-mono text-foreground hover:underline"
            >
              support@trivio.ink
            </a>
          </CardContent>
        </Card>
      </div>

      {/* Brand & Origin Card */}
      <Card>
        <CardContent className="p-8 text-center space-y-2">
          <Globe className="w-5 h-5 text-muted-foreground mx-auto" />
          <h3 className="text-sm font-semibold text-foreground">Trivio Open Source Platform</h3>
          <p className="text-xs text-muted-foreground">
            Official Brand Domain: <span className="text-foreground font-mono">trivio.ink</span> • Located in Sri Lanka
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
