import { AboutPage } from "@/features/about/about-page";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Methodology — Technical Documentation",
  description:
    "Complete technical documentation of the traffic intelligence platform including data pipeline, modeling approach, evaluation metrics, and limitations.",
  path: "/about",
});

export default function MethodologyRoute() {
  return <AboutPage />;
}
