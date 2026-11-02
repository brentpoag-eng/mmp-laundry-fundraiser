import { getStore } from "@netlify/blobs";

export const ordersStore = () => getStore({ name: "orders", consistency: "strong" });

// Newest first.
export async function loadAll(store = ordersStore()) {
  const { blobs } = await store.list();
  const all = await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })));
  return all.filter(Boolean).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}
