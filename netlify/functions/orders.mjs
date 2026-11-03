import { adminUser, json } from "./lib/auth.mjs";
import { ordersStore, loadAll } from "./lib/store.mjs";
import { updateOrder } from "./lib/orders.mjs";
import { payMethods } from "../../public/catalog.js";

// GET /api/orders            -> list all orders (admin)
// PATCH /api/orders?id=...   -> mark paid / unpaid: {paid: true, method: "cash_check"|"venmo"|"paypal"} or {paid: false} (admin)
// PUT /api/orders?id=...     -> edit one order (admin)
// DELETE /api/orders?id=...  -> remove one order (admin)
export default async (req) => {
  const user = adminUser(req);
  if (!user) return json({ error: "Unauthorized." }, 401);

  const store = ordersStore();
  if (req.method === "GET") return json({ orders: await loadAll(store), user });

  if (req.method === "PATCH") {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return json({ error: "Missing id." }, 400);
    const existing = await store.get(id, { type: "json" });
    if (!existing) return json({ error: "Order not found." }, 404);
    let body;
    try { body = await req.json(); } catch { return json({ error: "Invalid request." }, 400); }
    if (typeof body?.paid !== "boolean") return json({ error: "paid must be true or false." }, 400);
    if (body.paid && !Object.hasOwn(payMethods, body.method)) return json({ error: "Choose how it was paid: Cash/Check, Venmo or PayPal." }, 400);
    // Changing the method of an already-paid order keeps the original paid date and person.
    const keep = body.paid && existing.paid;
    const order = {
      ...existing,
      paid: body.paid,
      paidAt: body.paid ? (keep && existing.paidAt) || new Date().toISOString() : null,
      paidBy: body.paid ? (keep && existing.paidBy) || user : null,
      payMethod: body.paid ? body.method : null,
    };
    await store.setJSON(id, order);
    return json({ ok: true, order });
  }

  if (req.method === "PUT") {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return json({ error: "Missing id." }, 400);
    const existing = await store.get(id, { type: "json" });
    if (!existing) return json({ error: "Order not found." }, 404);
    let body;
    try { body = await req.json(); } catch { return json({ error: "Invalid request." }, 400); }
    const { order, error } = updateOrder(existing, body);
    if (error) return json({ error }, 400);
    order.updatedBy = user;
    await store.setJSON(id, order);
    return json({ ok: true, order });
  }

  if (req.method === "DELETE") {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return json({ error: "Missing id." }, 400);
    await store.delete(id);
    return json({ ok: true });
  }
  return json({ error: "Method not allowed." }, 405);
};

export const config = { path: "/api/orders" };
