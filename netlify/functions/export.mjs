import { adminUser, json } from "./lib/auth.mjs";
import { ordersStore, loadAll } from "./lib/store.mjs";
import { buildPdf } from "./lib/pdf.mjs";
import { buildTally } from "./lib/tally.mjs";
import { ordersToCsv } from "./lib/csv.mjs";

// GET /api/export?format=pdf            -> master PDF (all orders, one page per seller per 20 customers)
// GET /api/export?format=pdf&id=...     -> PDF for a single order
// GET /api/export?format=csv            -> all orders as CSV
// GET /api/export?format=tally          -> vendor's Individual Tally Form with totals per product
export default async (req) => {
  if (!adminUser(req)) return json({ error: "Unauthorized." }, 401);

  const url = new URL(req.url);
  const format = url.searchParams.get("format") || "pdf";
  const id = url.searchParams.get("id");
  const store = ordersStore();
  const stamp = new Date().toISOString().slice(0, 10);

  let orders;
  if (id) {
    const one = await store.get(id, { type: "json" });
    if (!one) return json({ error: "Order not found." }, 404);
    orders = [one];
  } else {
    orders = await loadAll(store);
  }

  if (format === "tally") {
    const bytes = await buildTally(orders);
    return new Response(bytes, {
      headers: {
        "content-type": "application/pdf",
        "content-disposition": `attachment; filename="tally-form-${stamp}.pdf"`,
        "cache-control": "no-store",
      },
    });
  }

  if (format === "csv") {
    return new Response(ordersToCsv(orders), {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": `attachment; filename="orders-${stamp}.csv"`,
        "cache-control": "no-store",
      },
    });
  }

  const bytes = await buildPdf(orders);
  return new Response(bytes, {
    headers: {
      "content-type": "application/pdf",
      "content-disposition": `attachment; filename="${id ? `order-${id}` : `master-orders-${stamp}`}.pdf"`,
      "cache-control": "no-store",
    },
  });
};

export const config = { path: "/api/export" };
