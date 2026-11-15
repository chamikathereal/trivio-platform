import type { Metadata } from "next";
import "./globals.css";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export const metadata: Metadata = {
  title: "Trivio — Payment Settlement Intelligence",
  description:
    "Deterministic, zero-float payment settlement calculation engine, dynamic merchant discount rate (MDR) models, and holiday-aware settlement calendar forecasting.",
  keywords: [
    "payment settlement",
    "mdr calculation",
    "merchant discount rate",
    "fintech",
    "settlement calendar",
    "zero float",
    "typescript sdk",
  ],
  authors: [{ name: "Trivio Engineering", url: "https://trivio.ink" }],
  openGraph: {
    title: "Trivio — Payment Settlement Intelligence",
    description:
      "Deterministic, zero-float payment settlement calculation engine and developer-first financial SDKs.",
    url: "https://trivio.ink",
    siteName: "Trivio",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Trivio — Payment Settlement Intelligence",
    description:
      "Deterministic payment settlement calculations and merchant fee modeling.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen flex flex-col bg-trivio-midnight text-trivio-warm antialiased selection:bg-trivio-cyan selection:text-trivio-midnight">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
