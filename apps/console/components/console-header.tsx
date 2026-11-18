"use client";

import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { useWorkspace } from "./workspace-context";
import {
  Building2,
  ExternalLink,
  Github,
  ShieldCheck,
  ChevronDown,
} from "lucide-react";
import { Badge } from "./ui/badge";

export function ConsoleHeader() {
  const { merchants, selectedMerchantId, setSelectedMerchantId } = useWorkspace();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/80 bg-background/85 backdrop-blur-xl">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Left: Brand Logo & Workspace Selector */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-7 w-24 sm:w-28 flex items-center">
              {/* Light Mode Logo */}
              <Image
                src="/trivio.ink.white.png"
                alt="Trivio Logo"
                fill
                className="object-contain block dark:hidden"
                priority
              />
              {/* Dark Mode Logo */}
              <Image
                src="/trivio.ink.black.png"
                alt="Trivio Logo"
                fill
                className="object-contain hidden dark:block"
                priority
              />
            </div>
            <div className="flex items-center gap-1.5 border-l border-border/80 pl-3">
              <span className="text-xs font-mono font-semibold tracking-wide text-foreground">
                Console
              </span>
              <Badge variant="outline" className="text-[9px] py-0 px-1.5 font-mono">
                Stage 4B
              </Badge>
            </div>
          </Link>

          {/* Workspace Quick Switcher */}
          <div className="hidden md:flex items-center gap-2 pl-2 border-l border-border/60">
            <Building2 className="w-3.5 h-3.5 text-muted-foreground" />
            <div className="relative">
              <select
                value={selectedMerchantId}
                onChange={(e) => setSelectedMerchantId(e.target.value)}
                className="h-8 pl-2.5 pr-7 rounded-md border border-border/80 bg-secondary/30 text-xs font-medium text-foreground appearance-none focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer hover:bg-secondary/60 transition-colors"
                aria-label="Select Active Merchant Workspace"
              >
                {merchants.map((m) => (
                  <option key={m.id} value={m.id} className="bg-background text-foreground">
                    {m.name} ({m.currency})
                  </option>
                ))}
              </select>
              <ChevronDown className="w-3 h-3 absolute right-2 top-2.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Right: Environment Pill, Docs, GitHub, Theme Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-4">
          <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-border/70 bg-secondary/30 text-[11px] font-mono text-muted-foreground">
            <ShieldCheck className="w-3.5 h-3.5 text-foreground" />
            <span>Local Engine · Zero Telemetry</span>
          </div>

          <a
            href="https://docs.trivio.ink"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors font-mono px-2 py-1"
          >
            <span>Docs</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href="https://github.com/trivio-ink/trivio-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
            aria-label="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
