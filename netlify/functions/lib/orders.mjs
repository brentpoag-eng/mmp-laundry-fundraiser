import { products, site, formatPhone } from "../../../public/catalog.js";

const clean = (v, max) =>
  String(v ?? "")
    .replace(/[\u0000-\u001f\u007f]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);

// Validates the editable fields and recomputes totals on the server (never trust client math).
function validate(body) {
  const customerName = clean(body?.customerName, 60);
  const phoneDigits = String(body?.phone ?? "").replace(/\D/g, "");
  const email = clean(body?.email, 80);

  if (!customerName) return { error: "Customer name is required." };
  if (!(phoneDigits.length === 10 || (phoneDigits.length === 11 && phoneDigits[0] === "1")))
    return { error: "Enter a valid 10-digit phone number." };
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Enter a valid email or leave it blank." };

  const raw = Array.isArray(body?.qty) ? body.qty : [];
  const qty = products.map((_, i) => {
    const n = Number(raw[i] ?? 0);
    return Number.isInteger(n) && n >= 0 && n <= 99 ? n : NaN;
  });
  if (qty.some(Number.isNaN)) return { error: "Quantities must be whole numbers from 0 to 99." };

  const units = qty.reduce((s, q) => s + q, 0);
  if (units === 0) return { error: "Add at least one item." };
  const total = qty.reduce((s, q, i) => s + q * products[i].price, 0);

  return { fields: { customerName, phone: formatPhone(phoneDigits), email, qty, units, total } };
}

export function buildOrder(body) {
  // A fixed seller in catalog.js always wins; the browser's value is only used if none is configured.
  const seller = site.seller || clean(body?.seller, 60);
  if (!seller) return { error: "Seller name is required." };
  const { fields, error } = validate(body);
  if (error) return { error };
  return {
    order: {
      id: `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`,
      createdAt: new Date().toISOString(),
      seller,
      ...fields,
    },
  };
}

// Admin edit: keeps id, createdAt and seller; replaces the rest.
export function updateOrder(existing, body) {
  const { fields, error } = validate(body);
  if (error) return { error };
  return { order: { ...existing, ...fields, updatedAt: new Date().toISOString() } };
}
