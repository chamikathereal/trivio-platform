"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  FileSpreadsheet,
  CalendarDays,
  Calculator,
  Code2,
  Info,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    badge: null,
  },
  {
    label: "Merchant Workspaces",
    href: "/merchants",
    icon: Building2,
    badge: null,
  },
  {
    label: "Fee Agreements",
    href: "/fee-agreements",
    icon: FileSpreadsheet,
    badge: null,
  },
  {
    label: "Settlement Policies",
    href: "/settlement-policies",
    icon: CalendarDays,
    badge: null,
  },
  {
    label: "Financial Simulation",
    href: "/simulation",
    icon: Calculator,
    badge: "Core",
  },
  {
    label: "Developer Integration",
    href: "/integrations",
    icon: Code2,
    badge: null,
  },
];

export function ConsoleSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-border/80 bg-background/50 md:min-h-[calc(100vh-3.5rem)] flex flex-col justify-between p-3 sm:p-4">
      <div className="space-y-4">
        {/* Navigation list */}
        <nav className="flex md:flex-col gap-1 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center justify-between gap-3 px-3 py-2 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                  isActive
                    ? "bg-secondary text-foreground font-semibold shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={cn("w-4 h-4", isActive ? "text-foreground" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="hidden sm:inline-flex text-[9px] font-mono uppercase px-1.5 py-0.2 rounded border border-border/80 bg-secondary/80 text-foreground font-semibold">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Stage 4B Non-Cloud Boundary Disclaimer */}
      <div className="hidden md:block pt-4 border-t border-border/60">
        <div className="p-3 rounded-lg border border-border/70 bg-secondary/20 space-y-2">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground">
            <Info className="w-3.5 h-3.5" />
            <span>Stage 4B Simulation</span>
          </div>
          <p className="text-[10px] text-muted-foreground leading-normal">
            Calculations execute in-memory using <code>@trivio.ink/core</code>. No credentials, tokens, or customer bank data are sent to external networks.
          </p>
        </div>
      </div>
    </aside>
  );
}
