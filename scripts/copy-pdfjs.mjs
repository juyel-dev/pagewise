// Copies PDF.js runtime assets (worker, cmaps, fonts) into public/pdfjs so the viewer is fully self-hosted.
import { cpSync, mkdirSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "pdfjs-dist");
const out = join(root, "public", "pdfjs");
if (!existsSync(src)) { console.error("pdfjs-dist not installed"); process.exit(1); }
mkdirSync(out, { recursive: true });
cpSync(join(src, "build", "pdf.worker.min.mjs"), join(out, "pdf.worker.min.mjs"));
cpSync(join(src, "cmaps"), join(out, "cmaps"), { recursive: true });
cpSync(join(src, "standard_fonts"), join(out, "standard_fonts"), { recursive: true });
console.log("pdfjs assets copied to public/pdfjs");
