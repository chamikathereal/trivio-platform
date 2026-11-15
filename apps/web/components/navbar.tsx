"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Menu, X, Github, ExternalLink, Terminal } from "lucide-react";

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-trivio-border bg-trivio-midnight/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <div className="relative h-9 w-32 sm:w-36">
            <Image
              src="/logo.png"
              alt="Trivio Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <Badge variant="cyan" className="hidden sm:inline-flex text-[10px]">
            v0.1.0 Live
          </Badge>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <Link
            href="/sdks"
            className="text-gray-300 hover:text-trivio-cyan transition-colors"
          >
            SDKs
          </Link>
          <Link
            href="/calculator"
            className="text-gray-300 hover:text-trivio-cyan transition-colors"
          >
            Interactive Demo
          </Link>
          <Link
            href="/about"
            className="text-gray-300 hover:text-trivio-cyan transition-colors"
          >
            About
          </Link>
          <Link
            href="/cloud"
            className="text-gray-300 hover:text-trivio-cyan transition-colors flex items-center gap-1.5"
          >
            Cloud
            <span className="text-[10px] text-amber-400 font-semibold border border-amber-500/30 px-1 rounded">
              Soon
            </span>
          </Link>
          <a
            href="https://github.com/trivio-ink/trivio-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-300 hover:text-trivio-cyan transition-colors flex items-center gap-1"
          >
            Docs
            <ExternalLink className="w-3 h-3 text-gray-400" />
          </a>
        </nav>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://github.com/trivio-ink/trivio-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-trivio-warm transition-colors p-2"
            aria-label="GitHub Repository"
          >
            <Github className="w-5 h-5" />
          </a>
          <Button asChild size="sm" variant="default" className="gap-2">
            <Link href="/calculator">
              <Terminal className="w-4 h-4" />
              Try Calculator
            </Link>
          </Button>
        </div>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="md:hidden p-2 text-gray-400 hover:text-white"
          aria-label="Toggle menu"
        >
          {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6 text-trivio-cyan" />}
        </button>
      </div>

      {/* Mobile nav drawer */}
      {isOpen && (
        <div className="md:hidden border-b border-trivio-border bg-trivio-midnight px-4 pt-2 pb-6 space-y-4">
          <Link
            href="/sdks"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-base font-medium text-gray-200 hover:text-trivio-cyan"
          >
            SDKs
          </Link>
          <Link
            href="/calculator"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-base font-medium text-gray-200 hover:text-trivio-cyan"
          >
            Interactive Demo
          </Link>
          <Link
            href="/about"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-base font-medium text-gray-200 hover:text-trivio-cyan"
          >
            About
          </Link>
          <Link
            href="/cloud"
            onClick={() => setIsOpen(false)}
            className="block py-2 text-base font-medium text-gray-200 hover:text-trivio-cyan"
          >
            Cloud (Coming Soon)
          </Link>
          <div className="pt-2 flex flex-col gap-2">
            <Button asChild size="sm" className="w-full">
              <Link href="/calculator">Launch Interactive Demo</Link>
            </Button>
          </div>
        </div>
      )}
    </header>
  );
}
