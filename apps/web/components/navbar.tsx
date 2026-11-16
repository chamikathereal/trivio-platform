"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { ThemeToggle } from "./theme-toggle";
import { Menu, X, Github, ExternalLink, Calculator } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full pt-3 pb-2 px-4 sm:px-6">
      {/* Full Glassmorphic Floating Pill Bar */}
      <div className="mx-auto max-w-6xl rounded-full border border-white/40 dark:border-white/15 bg-white/25 dark:bg-black/40 backdrop-blur-2xl backdrop-saturate-150 shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.7),0_12px_40px_-5px_rgba(0,0,0,0.18)] dark:shadow-[inset_0_1px_1px_0_rgba(255,255,255,0.18),0_12px_40px_-5px_rgba(0,0,0,0.7)] px-4 sm:px-6 py-2.5 flex items-center justify-between transition-all">
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
          <span className="hidden lg:inline-flex text-[10px] px-2.5 py-0.5 rounded-full border border-white/35 dark:border-white/15 bg-white/20 dark:bg-white/10 backdrop-blur-md text-foreground font-semibold shadow-sm">
            v0.1.0 Live
          </span>
        </Link>

        {/* Desktop Navigation Links with Frosted Pill Hovers */}
        <nav className="hidden md:flex items-center gap-2 text-xs lg:text-sm font-medium">
          <Link
            href="/sdks"
            className="text-foreground/80 hover:text-foreground hover:bg-white/25 dark:hover:bg-white/10 px-3.5 py-1.5 rounded-full transition-all duration-200"
          >
            SDKs
          </Link>
          <Link
            href="/calculator"
            className="text-foreground/80 hover:text-foreground hover:bg-white/25 dark:hover:bg-white/10 px-3.5 py-1.5 rounded-full transition-all duration-200"
          >
            Calculator
          </Link>
          <Link
            href="/about"
            className="text-foreground/80 hover:text-foreground hover:bg-white/25 dark:hover:bg-white/10 px-3.5 py-1.5 rounded-full transition-all duration-200"
          >
            About
          </Link>
          <Link
            href="/cloud"
            className="text-foreground/80 hover:text-foreground hover:bg-white/25 dark:hover:bg-white/10 px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1.5"
          >
            Cloud
            <span className="text-[9px] uppercase tracking-wider text-foreground/80 border border-white/30 dark:border-white/15 bg-white/20 dark:bg-white/10 px-1.5 py-0.2 rounded-full font-mono">
              Soon
            </span>
          </Link>
          <a
            href="https://docs.trivio.ink"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/80 hover:text-foreground hover:bg-white/25 dark:hover:bg-white/10 px-3.5 py-1.5 rounded-full transition-all duration-200 flex items-center gap-1"
          >
            Docs
            <ExternalLink className="w-3 h-3 text-foreground/60" />
          </a>
        </nav>

        {/* Action Controls & Theme Toggle */}
        <div className="hidden md:flex items-center gap-2.5">
          <a
            href="https://github.com/trivio-ink/trivio-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="text-foreground/80 hover:text-foreground transition-all p-2 rounded-full border border-white/30 dark:border-white/15 bg-white/15 dark:bg-white/5 hover:bg-white/30 dark:hover:bg-white/15 backdrop-blur-md shadow-sm"
            aria-label="GitHub Repository"
          >
            <Github className="w-4 h-4" />
          </a>

          <ThemeToggle />

          <Button asChild size="sm" className="rounded-full gap-2 px-4 shadow-lg bg-foreground text-background hover:bg-foreground/90 active:scale-95 transition-all">
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
            className="p-2 text-foreground hover:bg-white/20 dark:hover:bg-white/10 rounded-full transition-colors border border-white/25 dark:border-white/15 bg-white/10 backdrop-blur-md"
            aria-label="Toggle navigation menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Glassmorphic nav drawer */}
      {isOpen && (
        <div className="md:hidden mt-2 mx-auto max-w-6xl rounded-3xl border border-white/40 dark:border-white/15 bg-white/35 dark:bg-black/60 backdrop-blur-3xl p-6 shadow-2xl space-y-4 animate-accordion-down">
          <nav className="flex flex-col space-y-3 text-sm font-medium">
            <Link
              href="/sdks"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 rounded-xl text-foreground hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
            >
              SDKs Architecture
            </Link>
            <Link
              href="/calculator"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 rounded-xl text-foreground hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
            >
              Interactive Calculator
            </Link>
            <Link
              href="/about"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 rounded-xl text-foreground hover:bg-white/20 dark:hover:bg-white/10 transition-colors"
            >
              About & Mission
            </Link>
            <Link
              href="/cloud"
              onClick={() => setIsOpen(false)}
              className="px-4 py-2.5 rounded-xl text-foreground hover:bg-white/20 dark:hover:bg-white/10 transition-colors flex items-center justify-between"
            >
              <span>Cloud Roadmap</span>
              <span className="text-[10px] text-foreground/80 border border-white/30 px-2 py-0.5 rounded-full font-mono">
                Soon
              </span>
            </Link>
            <a
              href="https://docs.trivio.ink"
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 rounded-xl text-foreground hover:bg-white/20 dark:hover:bg-white/10 transition-colors flex items-center justify-between"
            >
              <span>Documentation</span>
              <ExternalLink className="w-4 h-4 text-foreground/60" />
            </a>
          </nav>

          <div className="pt-4 border-t border-white/20 dark:border-white/10 flex flex-col gap-2.5">
            <Button asChild size="default" variant="default" className="w-full rounded-full gap-2 justify-center shadow-lg">
              <Link href="/calculator" onClick={() => setIsOpen(false)}>
                <Calculator className="w-4 h-4" />
                Launch Calculator
              </Link>
            </Button>
            <a
              href="https://github.com/trivio-ink/trivio-platform"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 py-2 text-xs font-mono text-foreground/70 hover:text-foreground"
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
