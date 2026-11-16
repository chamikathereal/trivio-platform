"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { Github, ExternalLink } from "lucide-react";

export function DocsNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/75 backdrop-blur-xl">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-8 w-28">
              <Image
                src="/logo.png"
                alt="Trivio Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <div className="flex items-center gap-2 border-l border-border/80 pl-3">
            <span className="text-xs font-mono font-semibold text-foreground">Docs</span>
            <Badge variant="outline" className="text-[10px] font-mono">
              v0.1.0 Live
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 text-xs font-medium">
          <a
            href="https://trivio.ink"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors px-2.5 py-1 rounded-full border border-transparent hover:border-border/60 hover:bg-secondary/50 font-mono text-xs"
          >
            <span>trivio.ink</span>
            <ExternalLink className="w-3 h-3" />
          </a>

          <a
            href="https://github.com/trivio-ink/trivio-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-secondary/50"
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
