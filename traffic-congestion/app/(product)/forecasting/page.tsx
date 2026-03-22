import { ForecastPage } from "@/features/forecasting/forecast-page";
import { createMetadata } from "@/lib/metadata";

export const metadata = createMetadata({
  title: "Traffic Forecasting",
  description:
    "Compare actual versus predicted traffic demand, benchmark forecasting models, and see which model powers downstream optimization.",
  path: "/forecasting",
});

export default function ForecastingRoute() {
  return <ForecastPage />;
}
