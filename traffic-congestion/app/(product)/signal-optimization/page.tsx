import { SignalOptimizationPage } from "@/features/signals/signal-optimization-page";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Signal Optimization",
  description:
    "Compare baseline fixed-time signals against optimized demand-responsive timing with delay, throughput, and queue pressure analysis.",
  path: "/signal-optimization",
});

export default function SignalOptimizationRoute() {
  return <SignalOptimizationPage />;
}
