import { SDKsShowcase } from "@/components/sdks-showcase";

export const metadata = {
  title: "Trivio SDKs — Three Decoupled Engines. Zero Float Math.",
  description:
    "Explore the official Trivio payment settlement SDK packages: @trivio.ink/core, @trivio.ink/node, and @trivio.ink/react. 100% offline, zero-float precision, and zero cloud telemetry.",
};

export default function SDKsPage() {
  return <SDKsShowcase />;
}
