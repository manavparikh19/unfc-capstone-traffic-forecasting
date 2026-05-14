import path from "node:path";

export function getProcessedDataRoot() {
  return path.resolve(process.cwd(), "data", "processed");
}
