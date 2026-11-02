import { products } from "../../../public/catalog.js";

// Neutralize spreadsheet formula injection (cells starting with = + - @) and quote as needed.
const cell = (v) => {
  let s = String(v ?? "");
  if (/^[=+\-@\t\r]/.test(s)) s = "'" + s;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export function ordersToCsv(orders) {
  const head = [
    "Submitted",
    "Seller",
    "Customer",
    "Phone",
    "Email",
    "Total Units",
    "Total Cost",
    ...products.map((p) => `${p.category} - ${p.group} - ${p.name}`),
  ];
  const rows = orders.map((o) => [
    o.createdAt,
    o.seller,
    o.customerName,
    o.phone,
    o.email,
    o.units,
    o.total,
    ...o.qty.map((q) => (q > 0 ? q : "")),
  ]);
  return [head, ...rows].map((r) => r.map(cell).join(",")).join("\r\n") + "\r\n";
}
