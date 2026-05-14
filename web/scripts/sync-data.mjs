import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(webRoot, "..");

const processedFiles = [
  "forecast_model_results.csv",
  "traffic_demand_forecasts.csv",
  "traffic_flow_metrics_2015_2019.csv",
  "signal_timing_impact_summary.csv",
  "signal_timing_headline_metrics.csv",
  "signal_timing_strategy_detailed_results.csv",
  "location_signal_timing_improvement.csv",
];

const processedTarget = path.join(webRoot, "data", "processed");

fs.rmSync(path.join(webRoot, "data"), { recursive: true, force: true });
fs.mkdirSync(processedTarget, { recursive: true });

for (const filename of processedFiles) {
  fs.copyFileSync(
    path.join(repoRoot, "data", "processed", filename),
    path.join(processedTarget, filename),
  );
}
