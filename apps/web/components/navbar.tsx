"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { ThemeToggle } from "./theme-toggle";
import { Menu, X, Github, ExternalLink, Calculator } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full pt-3 pb-2 px-4 sm:px-6">
      <div className="mx-auto max-w-6xl rounded-full border border-border/80 bg-background/80 backdrop-blur-2xl shadow-sm px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all">
        {/* Brand logo - strictly preserved without alteration */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative h-8 w-28 sm:w-32">
            <Image
              src="/logo.png"
              alt="Trivio Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <Badge variant="heaven" className="hidden lg:inline-flex text-[10px] px-2.5 py-0.5">
            v0.1.0 Live
          </Badge>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-6 text-xs lg:text-sm font-medium">
          <Link
            href="/sdks"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            SDKs
          </Link>
          <Link
            href="/calculator"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Calculator
          </Link>
          <Link
            href="/about"
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            About
          </Link>
          <Link
            href="/cloud"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
          >
            Cloud
            <span className="text-[10px] text-foreground/80 border border-border px-1.5 py-0.2 rounded-full font-mono">
              Soon
            </span>
          </Link>
          <a
            href="https://docs.trivio.ink"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            Docs
            <ExternalLink className="w-3 h-3 text-muted-foreground" />
          </a>
        </nav>

        {/* Action Controls & Theme Toggle */}
        <div className="hidden md:flex items-center gap-2.5">
          <a
            href="https://github.com/trivio-ink/trivio-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-2 rounded-full hover:bg-secondary"
            aria-label="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          <ThemeToggle />

          <Button asChild size="sm" variant="default" className="rounded-full gap-2 px-4 shadow-sm">
            <Link href="/calculator">
              <Calculator className="w-3.5 h-3.5" />
              Launch Calculator
            </Link>
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="p-2 text-foreground hover:bg-secondary rounded-full transition-colors"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav drawer */}
      {isOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-6xl rounded-2xl border border-border bg-background/95 backdrop-blur-2xl p-6 shadow-xl space-y-4 animate-accordion-down">
          <nav className="flex flex-col space-y-3 text-sm font-medium">
            <Link
              href="/sdks"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              SDKs Architecture
            </Link>
            <Link
              href="/calculator"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              Interactive Calculator
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors"
            >
              About & Mission
            </Link>
            <Link
              href="/cloud"
              onClick={() => setIsOpen(false)}
              className="px-3 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors flex items-center justify-between"
            >
              <span>Cloud Roadmap</span>
              <span className="text-[10px] text-foreground/80 border border-border px-1.5 py-0.5 rounded-full font-mono">
                Soon
              </span>
            </Link>
            <a
              href="https://docs.trivio.ink"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 rounded-lg text-foreground hover:bg-secondary transition-colors flex items-center justify-between"
            >
              <span>Documentation</span>
              <ExternalLink className="w-4 h-4 text-muted-foreground" />
            </a>
          </nav>

          <div className="pt-4 border-t border-border flex flex-col gap-2.5">
            <Button asChild size="default" variant="default" className="w-full rounded-full gap-2 justify-center">
              <Link href="/calculator" onClick={() => setIsOpen(false)}>
                <Calculator className="w-4 h-4" />
                Launch Calculator
              </Link>
            </Button>
            <a
              href="https://github.com/trivio-ink/trivio-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 text-xs font-mono text-muted-foreground hover:text-foreground"
            >
              <Github className="w-4 h-4" />
              github.com/trivio-ink/trivio-platform
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
