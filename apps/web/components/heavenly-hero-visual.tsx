"use client";

import React, { useEffect, useRef } from "react";
import Image from "next/image";
import { DollarSign, Percent, Calendar, CheckCircle2 } from "lucide-react";
import gsap from "gsap";

export function HeavenlyHeroVisual() {
  const containerRef = useRef<HTMLDivElement>(null);
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  const card4Ref = useRef<HTMLDivElement>(null);
  const angelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Smooth ethereal entrance
      gsap.from(angelRef.current, {
        scale: 0.94,
        opacity: 0,
        duration: 1.4,
        ease: "power3.out",
      });

      // Orbiting cards stagger float
      const cards = [card1Ref.current, card2Ref.current, card3Ref.current, card4Ref.current];
      gsap.from(cards, {
        y: 30,
        opacity: 0,
        duration: 1,
        stagger: 0.15,
        ease: "power2.out",
        delay: 0.3,
      });

      // Subtle persistent floating motions
      if (card1Ref.current) {
        gsap.to(card1Ref.current, {
          y: -10,
          duration: 3.5,
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
          duration: 3.8,
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
          delay: 0.2,
        });
      }
      if (card4Ref.current) {
        gsap.to(card4Ref.current, {
          y: 10,
          duration: 4,
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
      className="relative w-full max-w-5xl mx-auto min-h-[440px] md:min-h-[580px] flex items-center justify-center my-6 select-none overflow-hidden sm:overflow-visible px-4"
    >
      {/* 1. Celestial Beam (Apple Vision Pro Overhead Spotlight) */}
      <div className="celestial-beam" />
      <div className="celestial-halo" />

      {/* 2. Central Angel of Settlement Figure */}
      <div
        ref={angelRef}
        className="relative z-10 w-64 h-64 sm:w-80 sm:h-80 md:w-[420px] md:h-[420px] rounded-3xl overflow-hidden shadow-2xl border border-border/80 group"
      >
        <Image
          src="/angel-of-settlement.png"
          alt="Trivio — The Angel of Settlement"
          fill
          priority
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
        {/* Soft edge vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-background/80 via-transparent to-transparent pointer-events-none" />
      </div>

      {/* 3. Mindly Floating Pill Cards (Desktop Absolute Orbit, Mobile Adaptive Flow) */}
      
      {/* Card 1: Top Left - Gross Minor Units */}
      <div
        ref={card1Ref}
        className="hidden md:flex absolute top-12 left-4 lg:left-12 z-20 items-center gap-3.5 px-4 py-3 rounded-2xl glass-orbit max-w-xs transition-all hover:scale-105 duration-300"
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
        className="hidden md:flex absolute top-8 right-4 lg:right-12 z-20 items-center gap-3.5 px-4 py-3 rounded-2xl glass-orbit max-w-xs transition-all hover:scale-105 duration-300"
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
        className="hidden md:flex absolute bottom-10 left-6 lg:left-16 z-20 items-center gap-3.5 px-4 py-3 rounded-2xl glass-orbit max-w-xs transition-all hover:scale-105 duration-300"
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
        className="hidden md:flex absolute bottom-12 right-6 lg:right-16 z-20 items-center gap-3.5 px-4 py-3 rounded-2xl glass-orbit max-w-xs transition-all hover:scale-105 duration-300"
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

      {/* Mobile Floating Grid (Below Angel on small screens) */}
      <div className="grid grid-cols-2 gap-3 w-full max-w-md mt-6 md:hidden z-20">
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
