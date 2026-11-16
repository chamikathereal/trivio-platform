"use client";

import React from "react";
import { DollarSign, Percent, Calendar, CheckCircle2 } from "lucide-react";

export function HeavenlyHeroVisual() {
  return (
    <div className="relative z-20 w-full max-w-5xl mx-auto pt-4 sm:pt-6 pb-2 select-none px-2 sm:px-4">
      {/* 4 Cards Grid - Responsive: 2 cols on mobile, 4 cols from md (768px) and up */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
        {/* Card 1: Gross Minor Units */}
        <div className="animate-card-1 flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border border-white/20 bg-black/65 backdrop-blur-xl transition-all hover:scale-105 duration-300 shadow-2xl text-white">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center text-white flex-shrink-0">
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="text-left min-w-0">
            <div className="text-[10px] sm:text-[11px] font-medium text-zinc-300 uppercase tracking-wider truncate">
              Gross Ingest
            </div>
            <div className="text-xs sm:text-sm font-semibold font-mono text-white truncate">
              $10,000.00 USD
            </div>
            <div className="text-[9px] sm:text-[10px] text-zinc-400 truncate">
              1,000,000 minor units
            </div>
          </div>
        </div>

        {/* Card 2: Zero Float MDR */}
        <div className="animate-card-2 flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border border-white/20 bg-black/65 backdrop-blur-xl transition-all hover:scale-105 duration-300 shadow-2xl text-white">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center text-white flex-shrink-0">
            <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="text-left min-w-0">
            <div className="text-[10px] sm:text-[11px] font-medium text-zinc-300 uppercase tracking-wider truncate">
              Deterministic MDR
            </div>
            <div className="text-xs sm:text-sm font-semibold font-mono text-white truncate">
              2.50% + $15.00
            </div>
            <div className="text-[9px] sm:text-[10px] text-zinc-400 truncate">
              Zero-float Round-Half-Up
            </div>
          </div>
        </div>

        {/* Card 3: Holiday Aware Settlement Calendar */}
        <div className="animate-card-3 flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border border-white/20 bg-black/65 backdrop-blur-xl transition-all hover:scale-105 duration-300 shadow-2xl text-white">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/10 flex items-center justify-center text-white flex-shrink-0">
            <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="text-left min-w-0">
            <div className="text-[10px] sm:text-[11px] font-medium text-zinc-300 uppercase tracking-wider truncate">
              Settlement Calendar
            </div>
            <div className="text-xs sm:text-sm font-semibold font-mono text-white truncate">
              T+2 Clearance
            </div>
            <div className="text-[9px] sm:text-[10px] text-zinc-400 truncate">
              Holiday & cut-off shifts
            </div>
          </div>
        </div>

        {/* Card 4: Net Confirmed Settlement */}
        <div className="animate-card-4 flex items-center gap-3 p-3.5 sm:p-4 rounded-2xl border border-white/20 bg-black/65 backdrop-blur-xl transition-all hover:scale-105 duration-300 shadow-2xl text-white">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-black flex items-center justify-center flex-shrink-0 font-bold">
            <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="text-left min-w-0">
            <div className="text-[10px] sm:text-[11px] font-medium text-zinc-300 uppercase tracking-wider truncate">
              Net Settlement
            </div>
            <div className="text-xs sm:text-sm font-semibold font-mono text-white truncate">
              $9,735.00 Net
            </div>
            <div className="text-[9px] sm:text-[10px] text-zinc-400 truncate">
              100% offline math
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
