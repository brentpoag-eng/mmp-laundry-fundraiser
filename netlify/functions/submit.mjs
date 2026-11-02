import { buildOrder } from "./lib/orders.mjs";
import { ordersStore } from "./lib/store.mjs";
import { json } from "./lib/auth.mjs";

export default async (req) => {
  if (req.method !== "POST") return json({ error: "POST only." }, 405);

  let body;
  try {
    body = await req.json();
  } catch {
    return json({ error: "Invalid request." }, 400);
  }

  // Honeypot: real people never fill this hidden field. Pretend success to bots.
  if (body?.website) return json({ ok: true });

  const { order, error } = buildOrder(body);
  if (error) return json({ error }, 400);

  await ordersStore().setJSON(order.id, order);
  return json({ ok: true, id: order.id, units: order.units, total: order.total });
};

export const config = { path: "/api/submit" };
