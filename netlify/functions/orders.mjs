import { adminUser, json } from "./lib/auth.mjs";
import { ordersStore, loadAll } from "./lib/store.mjs";
import { updateOrder } from "./lib/orders.mjs";

// GET /api/orders            -> list all orders (admin)
// PATCH /api/orders?id=...   -> mark paid / unpaid: {paid: true|false} (admin)
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
    const order = { ...existing, paid: body.paid, paidAt: body.paid ? new Date().toISOString() : null, paidBy: body.paid ? user : null };
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
