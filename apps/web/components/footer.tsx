import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Github, ExternalLink } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-border bg-background text-muted-foreground py-14 px-4 sm:px-6 relative z-10 transition-colors">
      <div className="container mx-auto max-w-6xl grid grid-cols-1 md:grid-cols-4 gap-10">
        {/* Brand column */}
        <div className="space-y-4 md:col-span-1">
          <div className="relative h-8 w-32 sm:w-36 flex items-center">
            {/* Light Mode Logo */}
            <Image
              src="/trivio.ink.white.png"
              alt="Trivio Logo"
              fill
              className="object-contain block dark:hidden"
            />
            {/* Dark Mode Logo */}
            <Image
              src="/trivio.ink.black.png"
              alt="Trivio Logo"
              fill
              className="object-contain hidden dark:block"
            />
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Deterministic payment settlement intelligence, dynamic merchant discount rate (MDR) modeling, and holiday-aware clearance cycles.
          </p>
          <div className="text-[11px] text-muted-foreground/80 space-y-1">
            <p className="font-medium text-foreground">The Agent of Heaven for Payment Engineers</p>
            <p>Estd. 2026 • Located in Sri Lanka</p>
          </div>
        </div>

        {/* Public Packages */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Open-Source SDKs</h4>
          <ul className="text-xs space-y-2.5">
            <li>
              <a
                href="https://www.npmjs.com/package/@trivio.ink/core"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors flex items-center justify-between group"
              >
                <span>@trivio.ink/core</span>
                <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground">v0.1.0</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.npmjs.com/package/@trivio.ink/node"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors flex items-center justify-between group"
              >
                <span>@trivio.ink/node</span>
                <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground">v0.1.0</span>
              </a>
            </li>
            <li>
              <a
                href="https://www.npmjs.com/package/@trivio.ink/react"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-foreground transition-colors flex items-center justify-between group"
              >
                <span>@trivio.ink/react</span>
                <span className="text-[10px] font-mono text-muted-foreground group-hover:text-foreground">v0.1.0</span>
              </a>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Navigation</h4>
          <ul className="text-xs space-y-2.5">
            <li>
              <Link href="/sdks" className="hover:text-foreground transition-colors">
                SDK Architecture
              </Link>
            </li>
            <li>
              <Link href="/calculator" className="hover:text-foreground transition-colors">
                Settlement Calculator
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-foreground transition-colors">
                About & Mission
              </Link>
            </li>
            <li>
              <Link href="/cloud" className="hover:text-foreground transition-colors">
                Cloud Roadmap (Coming Soon)
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-foreground transition-colors">
                Contact & Community
              </Link>
            </li>
          </ul>
        </div>

        {/* Financial & Architectural Policies */}
        <div className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-foreground">Governance</h4>
          <p className="text-[11px] leading-relaxed">
            Calculations run offline inside developer infrastructure without telemetry. Zero cardholder data (PAN, CVV, PIN) is ever processed or stored.
          </p>
          <div className="pt-2 text-[11px] text-muted-foreground/80 flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
            <span>Apache-2.0 Open-Source License</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto max-w-6xl mt-12 pt-6 border-t border-border/60 flex flex-col sm:flex-row items-center justify-between text-xs text-muted-foreground/80 gap-4">
        <p>© 2026 Trivio Engineering. All rights reserved.</p>
        <div className="flex items-center gap-4">
          <a
            href="https://github.com/trivio-ink/trivio-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            <Github className="w-3.5 h-3.5" />
            GitHub
          </a>
          <a
            href="https://docs.trivio.ink"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors flex items-center gap-1"
          >
            Documentation
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </footer>
  );
}
