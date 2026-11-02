import { writeFileSync } from "node:fs";
import { buildOrder } from "../netlify/functions/lib/orders.mjs";
import { buildPdf } from "../netlify/functions/lib/pdf.mjs";
import { products } from "../public/catalog.js";

const names = ["Ava Johnson", "Liam Smith", "Noah Brown", "Emma Davis", "Olivia Wilson", "Mason Miller", "Sophia Moore"];
const orders = [];
let seed = 7;
const rnd = (n) => (seed = (seed * 9301 + 49297) % 233280) % n;

function add(seller, i) {
  const qty = new Array(products.length).fill(0);
  for (let k = 0; k < 1 + rnd(3); k++) qty[rnd(products.length)] = 1 + rnd(3);
  const { order, error } = buildOrder({
    seller,
    customerName: `${names[rnd(names.length)]} ${i}`,
    phone: `812-555-${String(1000 + i)}`,
    qty,
  });
  if (error) throw new Error(error);
  orders.push(order);
}

for (let i = 0; i < 23; i++) add("Aletha", i); // forces a second page
for (let i = 0; i < 5; i++) add("Oliver", 100 + i);

// validation checks
const bad = [
  buildOrder({ seller: "", customerName: "x", phone: "8125551234", qty: [1] }),
  buildOrder({ seller: "a", customerName: "x", phone: "123", qty: [1] }),
  buildOrder({ seller: "a", customerName: "x", phone: "8125551234", qty: [] }),
  buildOrder({ seller: "a", customerName: "x", phone: "8125551234", qty: [1.5] }),
  buildOrder({ seller: "a", customerName: "x", phone: "8125551234", qty: [100] }),
];
console.log("validation errors:", bad.map((b) => b.error));

const bytes = await buildPdf(orders);
writeFileSync(new URL("./out-master.pdf", import.meta.url), bytes);
const one = await buildPdf([orders[0]]);
writeFileSync(new URL("./out-single.pdf", import.meta.url), one);
console.log("orders:", orders.length, "master bytes:", bytes.length, "single bytes:", one.length);
console.log("first order:", orders[0].units, "units, $" + orders[0].total);
