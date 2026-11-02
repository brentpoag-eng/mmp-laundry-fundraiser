// Regenerates netlify/functions/lib/template.js from test/template.pdf
// (run `npm run template` after replacing the PDF form).
import { readFileSync, writeFileSync } from "node:fs";

const pdf = readFileSync(new URL("../test/template.pdf", import.meta.url));
const out = `// AUTO-GENERATED from test/template.pdf by scripts/make-template.mjs. Do not edit.\nexport const TEMPLATE_B64 = "${pdf.toString("base64")}";\n`;
writeFileSync(new URL("../netlify/functions/lib/template.js", import.meta.url), out);
console.log("template.js written,", pdf.length, "bytes of PDF");
