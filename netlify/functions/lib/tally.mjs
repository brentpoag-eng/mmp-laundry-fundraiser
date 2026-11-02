import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { products, site } from "../../../public/catalog.js";
import { TALLY_LOGO_B64, TALLY_LOGO_SIZE } from "./tallyLogo.js";

// Rows of the vendor's "Individual Tally Form", top to bottom.
// h = green section header, s = blue sub-header (with "Qty:"), i = product row (idx = index into `products`), b = blank row.
const ROWS = [
  { t: "h", l: "Laundry Detergent Products" },
  { t: "s", l: "Tide Comparables" },
  { t: "i", l: "Original  (TR)", idx: 0 },
  { t: "i", l: "Free and Clear (Free)", idx: 1 },
  { t: "i", l: "With Downy (TD)", idx: 2 },
  { t: "i", l: "With Bleach (TB)", idx: 3 },
  { t: "i", l: "With Febreze (TF)", idx: 4 },
  { t: "b" },
  { t: "s", l: "Gain Comparables" },
  { t: "i", l: "Original (GR)", idx: 5 },
  { t: "b" },
  { t: "i", l: "Island Fresh (GIF)", idx: 6 },
  { t: "s", l: "Powder Stain Lifter" },
  { t: "i", l: "Oxy Powder", idx: 7 },
  { t: "i", l: "Fresh Scent Laundry Sheets (up to 520 loads)", idx: 8 },
  { t: "i", l: "Free and Sens Laundry Sheets (up to 520 loads)", idx: 9 },
  { t: "h", l: "Fabric Softener" },
  { t: "s", l: "Downy Comparables" },
  { t: "i", l: "Blue (April Fresh)", idx: 10 },
  { t: "i", l: "Free and Sensitive (Free/Sens)", idx: 11 },
  { t: "b" },
  { t: "b" },
  { t: "s", l: "Gain Comparable" },
  { t: "i", l: "Original (GSOFT)", idx: 12 },
  { t: "b" },
  { t: "h", l: "Laundry Paks", noQty: true },
  { t: "i", l: "Original Scent Liquid", idx: 13 },
  { t: "i", l: "with Stain Remover", idx: 14 },
  { t: "i", l: "Free and Clear Liquid", idx: 15 },
  { t: "h", l: "Scent Enhancers" },
  { t: "i", l: "Beads", idx: 16 },
  { t: "b" },
  { t: "h", l: "Dish Products" },
  { t: "i", l: "5-Gallon Blue", idx: 17 },
  { t: "i", l: "Liquid Dishwasher Paks", idx: 18 },
  { t: "h", l: "Trash Bags" },
  { t: "i", l: "15-18 Gallon (250/case white)", idx: 19 },
  { t: "i", l: "33 Gallon (150/case Black)", idx: 20 },
  { t: "i", l: "55 - 60 Gallon (100/case Black)", idx: 21 },
  { t: "T", l: "Total # of Units" },
];

const NOTES = [
  { top: 244, text: "Complete and submit this form and the money to your fundraising coordinator at the end of your campaign." },
  { top: 378, text: "Double check your orders before submitting this form to your coordinator.  You will utilize this form when picking up your product on delivery day to ensure accuracy." },
  { top: 503, text: "Neither Profitable Solutions Fundraising nor your fundraising coordinator will be held liable for misordering or distribution errors." },
  { top: 588, text: "All of our products are comparable to the national brands of Tide, Gain, Downy, and Dawn." },
];

const GREEN = rgb(0.765, 0.835, 0.6);
const BLUE = rgb(0.573, 0.804, 0.867);
const YELLOW = rgb(1, 1, 0);
const BLACK = rgb(0, 0, 0);

function wrap(font, text, size, width) {
  const out = [];
  let line = "";
  for (const w of text.split(/\s+/)) {
    const test = line ? line + " " + w : w;
    if (font.widthOfTextAtSize(test, size) > width && line) { out.push(line); line = w; } else line = test;
  }
  if (line) out.push(line);
  return out;
}

// Individual Tally Form filled with every product's total quantity across all orders.
export async function buildTally(orders) {
  const counts = new Array(products.length).fill(0);
  for (const o of orders) o.qty.forEach((q, i) => (counts[i] += q));
  const total = counts.reduce((a, b) => a + b, 0);

  const doc = await PDFDocument.create();
  doc.setTitle("Individual Tally Form");
  const page = doc.addPage([612, 792]);
  const reg = await doc.embedFont(StandardFonts.TimesRoman);
  const bold = await doc.embedFont(StandardFonts.TimesRomanBold);
  const Y = (top) => 792 - top;

  // logo + title
  const logo = await doc.embedJpg(Buffer.from(TALLY_LOGO_B64, "base64"));
  const lw = 270, lh = (lw * TALLY_LOGO_SIZE[1]) / TALLY_LOGO_SIZE[0];
  page.drawImage(logo, { x: 52, y: Y(48 + lh), width: lw, height: lh });
  page.drawText("Individual Tally Form", { x: 51, y: Y(129), size: 11.5, font: bold });

  // table geometry
  const X0 = 51, XQ = 277, X1 = 311, TOP = 136, RH = 14.7;
  ROWS.forEach((r, n) => {
    const top = TOP + n * RH;
    const y = Y(top + RH);
    const fill = r.t === "h" ? GREEN : r.t === "s" || r.t === "T" ? BLUE : null;
    page.drawRectangle({ x: X0, y, width: X1 - X0, height: RH, color: fill ?? undefined, borderColor: BLACK, borderWidth: 1 });
    if (r.t === "h") {
      const sz = 13;
      page.drawText(r.l, { x: X0 + (X1 - X0 - bold.widthOfTextAtSize(r.l, sz)) / 2, y: y + 3.6, size: sz, font: bold });
      return;
    }
    if (r.t !== "b") {
      page.drawText(r.l, { x: X0 + 2, y: y + 3.6, size: r.t === "i" ? 10.5 : 11, font: r.t === "i" ? reg : bold });
    }
    // quantity cell
    page.drawLine({ start: { x: XQ, y }, end: { x: XQ, y: y + RH }, thickness: 1, color: BLACK });
    if (r.t === "s") page.drawText("Qty:", { x: XQ + 3, y: y + 3.6, size: 11, font: bold });
    if (r.t === "T") {
      page.drawRectangle({ x: XQ, y, width: X1 - XQ, height: RH, color: YELLOW, borderColor: BLACK, borderWidth: 1 });
      const s = String(total);
      page.drawText(s, { x: XQ + (X1 - XQ - bold.widthOfTextAtSize(s, 11)) / 2, y: y + 3.6, size: 11, font: bold });
    }
    if (r.t === "i" && counts[r.idx] > 0) {
      const s = String(counts[r.idx]);
      page.drawText(s, { x: XQ + (X1 - XQ - bold.widthOfTextAtSize(s, 11)) / 2, y: y + 3.4, size: 11, font: bold });
    }
  });

  // seller block (right)
  const RX = 316;
  const field = (label, value, top) => {
    page.drawText(label, { x: RX, y: Y(top), size: 11, font: reg });
    const lx = RX + reg.widthOfTextAtSize(label, 11);
    page.drawLine({ start: { x: lx, y: Y(top) - 1.5 }, end: { x: 560, y: Y(top) - 1.5 }, thickness: 0.8, color: BLACK });
    if (value) page.drawText(value, { x: lx + 4, y: Y(top) + 1, size: 11, font: bold });
  };
  field("Seller's name:", site.seller, 150);
  field("Seller's phone:", site.sellerPhone || "", 178);
  field("Seller's email:", site.sellerEmail || "", 206);

  // static notes from the vendor's form
  for (const n of NOTES) {
    wrap(reg, n.text, 11.5, 235).forEach((ln, i) => {
      page.drawText(ln, { x: 316 + (245 - reg.widthOfTextAtSize(ln, 11.5)) / 2, y: Y(n.top + i * 14.5), size: 11.5, font: reg });
    });
  }

  return doc.save();
}
