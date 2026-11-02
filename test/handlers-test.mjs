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

// phone is normalized on submit; 7-digit numbers are rejected
list = (await (await orders(admin("/api/orders"))).json()).orders;
assert.ok(list.every((o) => /^\(\d{3}\) \d{3}-\d{4}$/.test(o.phone)), "phones formatted");
r = await post({ customerName: "Short", phone: "555-0101", qty });
assert.equal(r.status, 400);

// edit
const target = list[0];
const put = (id, body, key = "test-key-123") =>
  orders(new Request("http://x/api/orders?id=" + id, { method: "PUT", body: JSON.stringify(body), headers: { "x-admin-key": key } }));
const q2 = new Array(22).fill(0); q2[3] = 4;
assert.equal((await put(target.id, { customerName: "X", phone: "8125550000", qty: q2 }, "wrong")).status, 401);
r = await put(target.id, { customerName: "  Edited   Name ", phone: "1 (812) 555-9999", email: "", qty: q2 });
j = await r.json();
assert.equal(r.status, 200); assert.equal(j.order.phone, "(812) 555-9999");
assert.equal(j.order.units, 4); assert.equal(j.order.total, 160); assert.equal(j.order.customerName, "Edited Name");
assert.equal(j.order.id, target.id); assert.equal(j.order.createdAt, target.createdAt); assert.equal(j.order.seller, target.seller);
assert.equal((await put(target.id, { customerName: "X", phone: "123", qty: q2 })).status, 400);
assert.equal((await put(target.id, { customerName: "X", phone: "8125550000", qty: new Array(22).fill(0) })).status, 400);
assert.equal((await put("nope", { customerName: "X", phone: "8125550000", qty: q2 })).status, 404);
const afterEdit = (await (await orders(admin("/api/orders"))).json()).orders.find((o) => o.id === target.id);
assert.equal(afterEdit.customerName, "Edited Name");

// paid toggle
const patch = (id, body, key = "test-key-123") =>
  orders(new Request("http://x/api/orders?id=" + id, { method: "PATCH", body: JSON.stringify(body), headers: { "x-admin-key": key } }));
assert.equal((await patch(target.id, { paid: true }, "wrong")).status, 401);
assert.equal((await patch(target.id, { paid: "yes" })).status, 400);
assert.equal((await patch("nope", { paid: true })).status, 404);
j = await (await patch(target.id, { paid: true })).json();
assert.equal(j.order.paid, true); assert.ok(j.order.paidAt);
let csv2 = await (await exp(admin("/api/export?format=csv"))).text();
assert.match(csv2, /,Yes,20/);
writeFileSync(new URL("./out-paid.pdf", import.meta.url), Buffer.from(await (await exp(admin(`/api/export?format=pdf&id=${target.id}`))).arrayBuffer()));
// editing keeps paid status
r = await put(target.id, { customerName: "Edited Name", phone: "8125559999", qty: q2 });
assert.equal((await r.json()).order.paid, true);
j = await (await patch(target.id, { paid: false })).json();
assert.equal(j.order.paid, false); assert.equal(j.order.paidAt, null);
await patch(target.id, { paid: true });

// delete
assert.equal((await orders(admin(`/api/orders?id=${list[0].id}`, "DELETE"))).status, 200);
list = (await (await orders(admin("/api/orders"))).json()).orders;
assert.equal(list.length, 1);

console.log("handlers OK");
