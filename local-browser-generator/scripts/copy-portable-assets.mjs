import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
await mkdir(dist, { recursive: true });
await rm(path.join(dist, "public"), { recursive: true, force: true });
await cp(path.join(root, "public"), path.join(dist, "public"), { recursive: true });
await cp(path.join(root, "Start-LOA-Generator.bat"), path.join(dist, "Start-LOA-Generator.bat"));
await cp(path.join(root, "README.md"), path.join(dist, "README.md"));
console.log("Portable Windows assets copied to dist.");
