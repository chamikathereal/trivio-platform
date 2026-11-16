import type { Metadata } from "next";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Trivio — Agent of Heaven for Settlement Intelligence",
  description:
    "Deterministic, zero-float payment settlement calculation engine, dynamic merchant discount rate (MDR) models, and holiday-aware settlement calendar forecasting. Delivered with divine accuracy.",
  keywords: [
    "payment settlement",
    "mdr calculation",
    "merchant discount rate",
    "fintech",
    "settlement calendar",
    "zero float",
    "typescript sdk",
    "agent of heaven",
  ],
  authors: [{ name: "Trivio Engineering", url: "https://trivio.ink" }],
  openGraph: {
    title: "Trivio — Agent of Heaven for Settlement Intelligence",
    description:
      "Saving developers from the purgatory of complex financial calculations with deterministic zero-float math and holiday-aware clearance cycles.",
    url: "https://trivio.ink",
    siteName: "Trivio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trivio — Agent of Heaven for Settlement Intelligence",
    description:
      "Deterministic payment settlement calculations and merchant fee modeling with zero float math.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="color-scheme" content="dark light" />
      </head>
      <body className="min-h-screen flex flex-col bg-background text-foreground selection:bg-foreground selection:text-background antialiased font-sans">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange={false}
        >
          <div className="relative min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1 relative z-10">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
