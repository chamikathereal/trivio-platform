import type { Metadata } from "next";
import "./globals.css";
import { DocsNavbar } from "@/components/docs-navbar";
import { DocsSidebar } from "@/components/docs-sidebar";

export const metadata: Metadata = {
  title: "Trivio Developer Documentation",
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
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-trivio-midnight text-trivio-warm antialiased selection:bg-trivio-cyan selection:text-trivio-midnight">
        <DocsNavbar />
        <div className="flex-1 flex flex-col md:flex-row container mx-auto">
          <DocsSidebar />
          <main className="flex-1 p-6 md:p-10 max-w-4xl overflow-x-hidden">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
