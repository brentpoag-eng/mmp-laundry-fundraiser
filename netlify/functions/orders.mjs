import { isAdmin, json } from "./lib/auth.mjs";
import { ordersStore, loadAll } from "./lib/store.mjs";

// GET /api/orders            -> list all orders (admin)
// DELETE /api/orders?id=...  -> remove one order (admin)
export default async (req) => {
  if (!isAdmin(req)) return json({ error: "Unauthorized." }, 401);

  const store = ordersStore();
  if (req.method === "GET") return json({ orders: await loadAll(store) });

  if (req.method === "DELETE") {
    const id = new URL(req.url).searchParams.get("id");
    if (!id) return json({ error: "Missing id." }, 400);
    await store.delete(id);
    return json({ ok: true });
  }
  return json({ error: "Method not allowed." }, 405);
};

export const config = { path: "/api/orders" };
