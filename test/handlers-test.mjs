import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";

process.env.ADMIN_KEY = "test-key-123";
const submit = (await import("./bundle/submit.mjs")).default;
const orders = (await import("./bundle/orders.mjs")).default;
const exp = (await import("./bundle/export.mjs")).default;

const post = (body) =>
  submit(new Request("http://x/api/submit", { method: "POST", body: JSON.stringify(body), headers: { "content-type": "application/json" } }));
const admin = (url, method = "GET", key = "test-key-123") =>
  new Request("http://x" + url, { method, headers: { "x-admin-key": key } });

const qty = new Array(22).fill(0);
qty[0] = 2; qty[13] = 1; qty[21] = 3;

// submit: good, bad, honeypot
let r = await post({ seller: "Aletha", customerName: "Pat Doe", phone: "812-555-0101", email: "pat@example.com", qty });
let j = await r.json();
assert.equal(r.status, 200); assert.equal(j.units, 6); assert.equal(j.total, 2 * 40 + 45 + 3 * 40);
r = await post({ seller: "Aletha", customerName: "Sam Roe", phone: "8125550102", qty: [1] });
assert.equal(r.status, 200);
r = await post({ seller: "Aletha", customerName: "", phone: "8125550102", qty });
assert.equal(r.status, 400);
r = await post({ website: "spam", seller: "x", customerName: "x", phone: "8125550102", qty });
assert.equal((await r.json()).ok, true);

// auth
assert.equal((await orders(admin("/api/orders", "GET", "wrong"))).status, 401);
assert.equal((await exp(admin("/api/export?format=csv", "GET", ""))).status, 401);

// list: honeypot must NOT have stored anything
let list = (await (await orders(admin("/api/orders"))).json()).orders;
assert.equal(list.length, 2);

// exports
const pdf = await exp(admin("/api/export?format=pdf"));
assert.equal(pdf.headers.get("content-type"), "application/pdf");
writeFileSync(new URL("./out-handler-master.pdf", import.meta.url), Buffer.from(await pdf.arrayBuffer()));
const csv = await (await exp(admin("/api/export?format=csv"))).text();
assert.match(csv, /Pat Doe/); assert.match(csv, /^Submitted,Seller,Customer/);
const one = await exp(admin(`/api/export?format=pdf&id=${list[0].id}`));
assert.equal(one.status, 200);

// delete
assert.equal((await orders(admin(`/api/orders?id=${list[0].id}`, "DELETE"))).status, 200);
list = (await (await orders(admin("/api/orders"))).json()).orders;
assert.equal(list.length, 1);

console.log("handlers OK");
