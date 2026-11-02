import { PDFDocument } from "pdf-lib";
import { TEMPLATE_B64 } from "./template.js";
import { products, site } from "../../../public/catalog.js";

const ROWS_PER_PAGE = 20;
const money = (n) => `$${n}`; // all prices are whole dollars

async function fillPage(seller, rows) {
  const doc = await PDFDocument.load(Buffer.from(TEMPLATE_B64, "base64"));
  const form = doc.getForm();
  // Explicit font sizes: the template fields would otherwise auto-size and look inconsistent.
  const set = (name, value, size = 8) => {
    if (value === "" || value == null) return;
    const f = form.getTextField(name);
    f.acroField.setDefaultAppearance(`/Helv ${size} Tf 0 g`);
    f.setText(String(value));
  };

  set("seller_name", seller);
  set("payable_to", site.payableTo);

  const colUnits = new Array(products.length).fill(0);
  let sumUnits = 0;
  let sumCost = 0;
  let sumPaid = 0;

  rows.forEach((o, r) => {
    set(`cust_name_${r}`, o.customerName);
    set(`cust_phone_${r}`, o.phone, 7.5);
    o.qty.forEach((q, c) => {
      if (q > 0) set(`qty_${r}_${c}`, q);
      colUnits[c] += q;
    });
    set(`tot_units_${r}`, o.units);
    set(`tot_cost_${r}`, money(o.total), 6.5);
    if (o.paid) {
      set(`tot_paid_${r}`, money(o.total), 6.5);
      sumPaid += o.total;
    }
    sumUnits += o.units;
    sumCost += o.total;
  });

  colUnits.forEach((n, c) => n > 0 && set(`sum_${c}`, n));
  set("sum_units", sumUnits);
  set("sum_cost", money(sumCost), 6.5);
  if (sumPaid > 0) set("sum_paid", money(sumPaid), 6.5);

  form.flatten();
  return doc;
}

// Builds one PDF with the paper form filled in: one page per seller (20 customers per page).
export async function buildPdf(orders) {
  const bySeller = new Map();
  for (const o of [...orders].sort((a, b) => (a.createdAt < b.createdAt ? -1 : 1))) {
    const key = o.seller.trim().toLowerCase();
    if (!bySeller.has(key)) bySeller.set(key, { seller: o.seller, orders: [] });
    bySeller.get(key).orders.push(o);
  }

  const out = await PDFDocument.create();
  const sellers = [...bySeller.values()].sort((a, b) => a.seller.localeCompare(b.seller));
  for (const { seller, orders: list } of sellers) {
    for (let i = 0; i < list.length; i += ROWS_PER_PAGE) {
      const filled = await fillPage(seller, list.slice(i, i + ROWS_PER_PAGE));
      const [page] = await out.copyPages(filled, [0]);
      out.addPage(page);
    }
  }
  if (out.getPageCount() === 0) {
    const [page] = await out.copyPages(await fillPage("", []), [0]);
    out.addPage(page);
  }
  return out.save();
}
