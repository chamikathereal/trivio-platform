import Link from "next/link";
import Image from "next/image";
import { ShieldCheck } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t border-trivio-border bg-trivio-midnight/90 text-gray-400 py-12 px-4 sm:px-6">
      <div className="container mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Brand column */}
        <div className="space-y-4 md:col-span-1">
          <div className="relative h-9 w-32">
            <Image
              src="/logo.png"
              alt="Trivio Logo"
              fill
              className="object-contain"
            />
          </div>
          <p className="text-xs text-gray-400 leading-relaxed">
            Deterministic payment settlement intelligence, dynamic merchant discount rate (MDR) calculations, and holiday-aware settlement calendar forecasting.
          </p>
          <div className="text-[11px] text-gray-500 space-y-1">
            <p className="font-semibold text-gray-400">Trusted • Timeless • Transparent</p>
            <p>Estd. 2026 • Located in Sri Lanka</p>
          </div>
        </div>

        {/* Public Packages */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-trivio-warm">Open-Source SDKs</h4>
          <ul className="text-xs space-y-2">
            <li>
              <a
                href="https://www.npmjs.com/package/@trivio.ink/core"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-trivio-cyan transition-colors"
              >
                @trivio.ink/core (v0.1.0)
              </a>
            </li>
            <li>
              <a
                href="https://www.npmjs.com/package/@trivio.ink/node"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-trivio-cyan transition-colors"
              >
                @trivio.ink/node (v0.1.0)
              </a>
            </li>
            <li>
              <a
                href="https://www.npmjs.com/package/@trivio.ink/react"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-trivio-cyan transition-colors"
              >
                @trivio.ink/react (v0.1.0)
              </a>
            </li>
          </ul>
        </div>

        {/* Navigation */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-trivio-warm">Navigation</h4>
          <ul className="text-xs space-y-2">
            <li>
              <Link href="/sdks" className="hover:text-trivio-cyan transition-colors">
                SDK Architecture
              </Link>
            </li>
            <li>
              <Link href="/calculator" className="hover:text-trivio-cyan transition-colors">
                Settlement Calculator
              </Link>
            </li>
            <li>
              <Link href="/about" className="hover:text-trivio-cyan transition-colors">
                About Trivio
              </Link>
            </li>
            <li>
              <Link href="/cloud" className="hover:text-trivio-cyan transition-colors">
                Cloud Roadmap (Coming Soon)
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-trivio-cyan transition-colors">
                Contact & Support
              </Link>
            </li>
          </ul>
        </div>

        {/* Legal & Governance */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-trivio-warm">Legal & Governance</h4>
          <p className="text-[11px] text-gray-500 leading-relaxed">
            The core calculation SDKs are licensed under the Apache License, Version 2.0 (Apache-2.0). All transactional data remains developer-owned and local.
          </p>
          <div className="flex items-center gap-2 text-xs text-emerald-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Developer-Owned Payment Data</span>
          </div>
        </div>
      </div>

      {/* Financial disclaimer */}
      <div className="container mx-auto mt-8 pt-8 border-t border-trivio-border/60 text-center">
        <p className="text-[11px] text-gray-500 max-w-4xl mx-auto leading-relaxed">
          <strong>Settlement Disclaimer:</strong> Calculations and timeline forecasts provided by Trivio SDKs are deterministic mathematical models and financial estimates computed locally. They do not constitute banking advice, binding credit guarantees, or confirmed acquirer settlement credits.
        </p>
        <p className="text-[11px] text-gray-600 mt-4 flex items-center justify-center gap-1">
          © 2026 trivio.ink. All rights reserved. Built with precision for developers worldwide.
        </p>
      </div>
    </footer>
  );
}
