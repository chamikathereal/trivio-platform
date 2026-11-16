import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { DocsNavbar } from "@/components/docs-navbar";
import { DocsSidebar } from "@/components/docs-sidebar";

export const metadata: Metadata = {
  title: "Trivio Developer Documentation — Angelic Settlement Primitives",
  description:
    "Official developer guides, API contracts, financial math invariants, and integration references for Trivio SDKs.",
  keywords: [
    "trivio docs",
    "payment settlement",
    "merchant discount rate",
    "financial math",
    "settlement calendar",
    "typescript sdk",
  ],
};

export default function DocsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-background text-foreground antialiased selection:bg-foreground selection:text-background">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          {/* Subtle Celestial Ambient Beam */}
          <div className="celestial-beam opacity-60 pointer-events-none" />

          <DocsNavbar />
          <div className="flex-1 flex flex-col md:flex-row container mx-auto relative z-10">
            <DocsSidebar />
            <main className="flex-1 p-6 md:p-10 max-w-4xl overflow-x-hidden">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
