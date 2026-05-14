import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const webRoot = path.resolve(__dirname, "..");
const repoRoot = path.resolve(webRoot, "..");

const copies = [
  {
    from: path.join(repoRoot, "data", "processed"),
    to: path.join(webRoot, "data", "processed"),
  },
  {
    from: path.join(repoRoot, "data", "raw", "traffic"),
    to: path.join(webRoot, "data", "raw", "traffic"),
  },
];

for (const { from, to } of copies) {
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.rmSync(to, { recursive: true, force: true });
  fs.cpSync(from, to, { recursive: true });
}
