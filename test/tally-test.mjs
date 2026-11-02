import { writeFileSync } from "node:fs";
import assert from "node:assert/strict";
import { buildOrder } from "../netlify/functions/lib/orders.mjs";
import { buildTally } from "../netlify/functions/lib/tally.mjs";

const mk = (qty) => buildOrder({ customerName: "T", phone: "8125550101", qty }).order;
const a = new Array(22).fill(0); a[0] = 2; a[7] = 1; a[21] = 3;
const b = new Array(22).fill(0); b[0] = 1; b[13] = 4; b[19] = 2; b[12] = 5;
const bytes = await buildTally([mk(a), mk(b)]);
writeFileSync(new URL("./out-tally.pdf", import.meta.url), bytes);
console.log("tally bytes", bytes.length);
