import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { WorkspaceProvider } from "@/components/workspace-context";
import { ConsoleHeader } from "@/components/console-header";
import { ConsoleSidebar } from "@/components/console-sidebar";

export const metadata: Metadata = {
  title: "Trivio Developer Console — Merchant Settlement Intelligence",
  description: "Enterprise merchant settlement intelligence console. Configure MDR fee agreements, cut-off calendars, and test deterministic payouts locally.",
  icons: {
    icon: "/trivio.ink.white.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased selection:bg-foreground selection:text-background">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <WorkspaceProvider>
            <div className="min-h-screen flex flex-col">
              <ConsoleHeader />
              <div className="flex-1 flex flex-col md:flex-row">
                <ConsoleSidebar />
                <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
                  {children}
                </main>
              </div>
            </div>
          </WorkspaceProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
