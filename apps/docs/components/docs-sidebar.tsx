"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

interface DocLink {
  title: string;
  href: string;
  tag?: string;
}

interface DocGroup {
  category: string;
  items: DocLink[];
}

const docGroups: DocGroup[] = [
  {
    category: "Overview & Getting Started",
    items: [
      { title: "Introduction", href: "/" },
      { title: "SDK Installation", href: "/installation" },
      { title: "Architecture & Design", href: "/architecture" },
    ],
  },
  {
    category: "SDK Quick Starts",
    items: [
      { title: "Core SDK (@trivio.ink/core)", href: "/quickstart/core", tag: "Engine" },
      { title: "Node.js SDK (@trivio.ink/node)", href: "/quickstart/node", tag: "Server" },
      { title: "React SDK (@trivio.ink/react)", href: "/quickstart/react", tag: "UI" },
    ],
  },
  {
    category: "Financial Engine Primitives",
    items: [
      { title: "Fee Agreements & Dynamic Rules", href: "/fees" },
      { title: "Settlement Calendars & Cycles", href: "/calendars" },
      { title: "Timezones & Cut-Off Windows", href: "/timezones" },
      { title: "Zero-Float Monetary Precision", href: "/precision" },
      { title: "Error Handling & Invariants", href: "/errors" },
    ],
  },
  {
    category: "Governance & Operations",
    items: [
      { title: "Security & PCI Boundaries", href: "/security" },
      { title: "API Reference & Types", href: "/api-reference" },
      { title: "Apache-2.0 Licensing", href: "/licensing" },
      { title: "FAQ & Limitations", href: "/faq" },
    ],
  },
];

export function DocsSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-full md:w-64 flex-shrink-0 border-b md:border-b-0 md:border-r border-border/80 p-4 sm:p-6 overflow-y-auto">
      <div className="space-y-6">
        {docGroups.map((group) => (
          <div key={group.category} className="space-y-2">
            <h4 className="text-[11px] font-mono font-bold uppercase tracking-wider text-muted-foreground/80">
              {group.category}
            </h4>
            <ul className="space-y-1 text-xs">
              {group.items.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center justify-between rounded-lg px-3 py-2 transition-all font-medium text-xs",
                        isActive
                          ? "bg-foreground text-background font-semibold shadow-sm"
                          : "text-muted-foreground hover:text-foreground hover:bg-secondary/60"
                      )}
                    >
                      <span className="truncate">{item.title}</span>
                      {item.tag && (
                        <span
                          className={cn(
                            "text-[9px] uppercase px-1.5 py-0.5 rounded font-mono ml-2 flex-shrink-0",
                            isActive
                              ? "bg-background text-foreground border border-background/20"
                              : "border border-border/80 bg-secondary/50 text-muted-foreground"
                          )}
                        >
                          {item.tag}
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
    </aside>
  );
}
