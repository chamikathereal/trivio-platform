"use client";

import Link from "next/link";
import Image from "next/image";
import { Badge } from "./ui/badge";
import { Github, ExternalLink } from "lucide-react";

export function DocsNavbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-trivio-border bg-trivio-midnight/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="relative h-9 w-32">
              <Image
                src="/logo.png"
                alt="Trivio Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>
          <div className="flex items-center gap-2 border-l border-trivio-border/80 pl-3">
            <span className="text-xs font-semibold text-gray-300">Docs</span>
            <Badge variant="cyan" className="text-[10px]">
              v0.1.0
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs font-medium">
          <a
            href="https://trivio.ink"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1 text-gray-400 hover:text-trivio-cyan transition-colors"
          >
            <span>trivio.ink</span>
            <ExternalLink className="w-3 h-3" />
          </a>
          <a
            href="https://github.com/trivio-ink/trivio-platform"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="GitHub Repository"
          >
            <Github className="w-5 h-5" />
          </a>
        </div>
      </div>
    </header>
  );
}
