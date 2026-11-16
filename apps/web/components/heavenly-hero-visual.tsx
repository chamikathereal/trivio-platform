"use client";

import React, { useEffect, useRef } from "react";
import { DollarSign, Percent, Calendar, CheckCircle2 } from "lucide-react";
import gsap from "gsap";

export function HeavenlyHeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Orbiting cards stagger float entrance
      const cards = [card1Ref.current, card2Ref.current, card3Ref.current, card4Ref.current];
      gsap.from(cards, {
        y: 35,
        opacity: 0,
        duration: 1.1,
        stagger: 0.15,
        ease: "power2.out",
        delay: 0.2,
      });

      // Subtle persistent floating motions (Mindly-style spatial float)
      if (card1Ref.current) {
        gsap.to(card1Ref.current, {
          y: -10,
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
      if (card2Ref.current) {
        gsap.to(card2Ref.current, {
          y: -12,
          duration: 4.2,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.4,
        });
      }
      if (card3Ref.current) {
        gsap.to(card3Ref.current, {
          y: 8,
          duration: 3.6,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.2,
        });
      }
      if (card4Ref.current) {
        gsap.to(card4Ref.current, {
          y: 10,
          duration: 4.1,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.6,
        });
      }
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full max-w-5xl mx-auto pt-6 pb-2 select-none px-2 sm:px-4"
    >
      {/* Desktop Spatial 4-Card Floating Grid */}
      <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 z-20">
        {/* Card 1: Gross Minor Units */}
        <div
          ref={card1Ref}
          className="flex items-center gap-3.5 p-4 rounded-2xl glass-orbit transition-all hover:scale-105 duration-300 shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground flex-shrink-0">
            <DollarSign className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Gross Ingest
            </div>
            <div className="text-sm font-semibold font-mono text-foreground">
              $10,000.00 USD
            </div>
            <div className="text-[10px] text-muted-foreground/80">
              1,000,000 minor units
            </div>
          </div>
        </div>

        {/* Card 2: Zero Float MDR */}
        <div
          ref={card2Ref}
          className="flex items-center gap-3.5 p-4 rounded-2xl glass-orbit transition-all hover:scale-105 duration-300 shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground flex-shrink-0">
            <Percent className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Deterministic MDR
            </div>
            <div className="text-sm font-semibold font-mono text-foreground">
              2.50% + $15.00
            </div>
            <div className="text-[10px] text-muted-foreground/80">
              Zero-float Round-Half-Up
            </div>
          </div>
        </div>

        {/* Card 3: Holiday Aware Settlement Calendar */}
        <div
          ref={card3Ref}
          className="flex items-center gap-3.5 p-4 rounded-2xl glass-orbit transition-all hover:scale-105 duration-300 shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-foreground/10 flex items-center justify-center text-foreground flex-shrink-0">
            <Calendar className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Settlement Calendar
            </div>
            <div className="text-sm font-semibold font-mono text-foreground">
              T+2 Holiday Clearance
            </div>
            <div className="text-[10px] text-muted-foreground/80">
              Cut-off & banking holiday shifts
            </div>
          </div>
        </div>

        {/* Card 4: Net Confirmed Settlement */}
        <div
          ref={card4Ref}
          className="flex items-center gap-3.5 p-4 rounded-2xl glass-orbit transition-all hover:scale-105 duration-300 shadow-xl"
        >
          <div className="w-10 h-10 rounded-xl bg-foreground text-background flex items-center justify-center flex-shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Net Settlement
            </div>
            <div className="text-sm font-semibold font-mono text-foreground">
              $9,735.00 Net Payout
            </div>
            <div className="text-[10px] text-muted-foreground/80">
              100% offline & local calculation
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Floating Grid (Below artwork on small screens) */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto mt-4 md:hidden z-20">
        <div className="p-3 rounded-xl glass-card flex flex-col gap-1 text-left">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-semibold">
            <DollarSign className="w-3.5 h-3.5" />
            <span>Gross</span>
          </div>
          <span className="font-mono text-xs font-semibold text-foreground">$10,000.00</span>
          <span className="text-[9px] text-muted-foreground">Minor units</span>
        </div>

        <div className="p-3 rounded-xl glass-card flex flex-col gap-1 text-left">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-semibold">
            <Percent className="w-3.5 h-3.5" />
            <span>MDR Fee</span>
          </div>
          <span className="font-mono text-xs font-semibold text-foreground">2.50% + $15</span>
          <span className="text-[9px] text-muted-foreground">Zero float</span>
        </div>

        <div className="p-3 rounded-xl glass-card flex flex-col gap-1 text-left">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-semibold">
            <Calendar className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </div>
          <span className="font-mono text-xs font-semibold text-foreground">T+2 Cycle</span>
          <span className="text-[9px] text-muted-foreground">Holiday aware</span>
        </div>

        <div className="p-3 rounded-xl glass-card flex flex-col gap-1 text-left">
          <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground uppercase font-semibold">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Net Payout</span>
          </div>
          <span className="font-mono text-xs font-semibold text-foreground">$9,735.00</span>
          <span className="text-[9px] text-muted-foreground">Exact pennies</span>
        </div>
      </div>
    </div>
  );
}
