"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { DollarSign, Percent, Calendar, CheckCircle2, Sparkles } from "lucide-react";
import gsap from "gsap";

export function HeavenlyHeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);
  const heroImageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Smooth ethereal entrance for the grand masterpiece
      gsap.from(heroImageRef.current, {
        scale: 0.95,
        opacity: 0,
        duration: 1.4,
        ease: "power3.out",
      });

      // Orbiting cards stagger float entrance
      const cards = [card1Ref.current, card2Ref.current, card3Ref.current, card4Ref.current];
      gsap.from(cards, {
        y: 25,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power2.out",
        delay: 0.35,
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
      className="relative w-full max-w-5xl mx-auto my-8 select-none px-2 sm:px-4"
    >
      {/* 1. Celestial Beam (Apple Vision Pro Overhead Spotlight) */}
      <div className="celestial-beam" />
      <div className="celestial-halo" />

      {/* 2. Central Masterpiece: Angels of Salvation ascending from Purgatory */}
      <div className="relative z-10 mx-auto max-w-4xl">
        <div
          ref={heroImageRef}
          className="relative w-full aspect-[16/9] rounded-3xl overflow-hidden glass-card p-2 sm:p-3 shadow-2xl transition-all duration-700"
        >
          <div className="relative w-full h-full rounded-2xl overflow-hidden group">
            <Image
              src="/angels-of-salvation.jpg"
              alt="Trivio — Angels of Salvation Ascending from Financial Purgatory"
              fill
              priority
              className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
            />
            {/* Soft ethereal bottom gradient vignette */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent pointer-events-none" />

            {/* Glassmorphic Title Pill inside the artwork */}
            <div className="absolute top-3 left-3 sm:top-5 sm:left-5 z-20 flex items-center gap-2 px-3.5 py-1.5 rounded-full glass-pill text-[11px] font-medium tracking-wide text-foreground shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-foreground" />
              <span>Ascent from Financial Purgatory</span>
            </div>

            {/* Subtle caption badge at bottom */}
            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-5 z-20 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full glass-pill text-[10px] text-foreground/80 font-mono">
              <span>Agent of Heaven • Deterministic Settlement</span>
            </div>
          </div>
        </div>

        {/* 3. Mindly Floating Pill Cards (Floating around the artwork on md+ screens) */}

        {/* Card 1: Top Left - Gross Minor Units */}
        <div
          ref={card1Ref}
          className="hidden md:flex absolute -top-6 -left-6 lg:-left-10 z-20 items-center gap-3.5 px-4 py-3 rounded-2xl glass-orbit max-w-xs transition-all hover:scale-105 duration-300"
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

        {/* Card 2: Top Right - Zero Float MDR */}
        <div
          ref={card2Ref}
          className="hidden md:flex absolute -top-6 -right-6 lg:-right-10 z-20 items-center gap-3.5 px-4 py-3 rounded-2xl glass-orbit max-w-xs transition-all hover:scale-105 duration-300"
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

        {/* Card 3: Bottom Left - Holiday Aware Settlement Calendar */}
        <div
          ref={card3Ref}
          className="hidden md:flex absolute -bottom-6 -left-6 lg:-left-10 z-20 items-center gap-3.5 px-4 py-3 rounded-2xl glass-orbit max-w-xs transition-all hover:scale-105 duration-300"
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

        {/* Card 4: Bottom Right - Net Confirmed Settlement */}
        <div
          ref={card4Ref}
          className="hidden md:flex absolute -bottom-6 -right-6 lg:-right-10 z-20 items-center gap-3.5 px-4 py-3 rounded-2xl glass-orbit max-w-xs transition-all hover:scale-105 duration-300"
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
      <div className="grid grid-cols-2 gap-3 w-full max-w-md mx-auto mt-6 md:hidden z-20">
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
