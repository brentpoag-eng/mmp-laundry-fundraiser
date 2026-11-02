// Single source of truth for the order form: used by the web page AND the server functions.
// Product order here = column order on the PDF form. Do not reorder without regenerating the PDF template.

export const site = {
  title: "MMP Laundry Fundraiser",
  // Every order is credited to this seller (shown on the page and printed on the PDF).
  seller: "Aletha Poag",
  supporting: "FJRIMB & FJ Reitz Theatre",
  salePeriod: "10/26 - 11/10/26",
  // Who checks are made out to. Shown on the page and printed on the PDF. Fill this in.
  payableTo: "",
  deliveryNote: "Delivery date TBD",
  footnote:
    "All of our products are comparable to the national brands of Tide, Gain, Downy, Dawn, Snuggle and Cascade. " +
    "They are not manufactured by P&G or other national manufacturers. All 5 gallon containers include a dispensing pump.",
};

const C = (category, price, groups) =>
  groups.flatMap(([group, names]) => names.map((name) => ({ category, group, name, price })));

export const products = [
  ...C("Laundry Detergent Products", 40, [
    [
      "5 Gallon Liquid Tide (comparable, pump included)",
      ["Original Scent", "Free (No dye, or scent)", "w/Downy (April Fresh)", "w/Bleach (color safe)", "w/Febreze"],
    ],
    ["5 Gallon Liquid Gain (comparable, pump included)", ["Original Scent", "Island Fresh"]],
    ["Powder Stain Lifter", ["Oxy Powder (1 gal. pail w/scoop)"]],
    ["ECO Friendly Laundry Detergent Sheets", ["Fresh Scent (Qty. 520)", "Free and Clear (Qty. 520)"]],
  ]),
  ...C("Fabric Softener", 40, [
    ["Comparable to Downy or Gain (pump included)", ["Blue April Fresh", "Free & Sensitive", "Gain Original"]],
  ]),
  ...C("Laundry Paks", 45, [
    ["Liquid PAKS", ["Original Scent (Qty 225)", "with Stain Remover (Qty 200)", "Free & Clear (Qty 225)"]],
  ]),
  ...C("Scent Beads", 45, [["Beads", ["Fresh Scent (1 gallon pail w/scoop)"]]]),
  ...C("Dish Soap", 40, [["Liquid 5 Gal", ["Blue Antibacterial (pump)"]]]),
  ...C("Dish Paks", 45, [["Gel", ["Dishwasher PAKs (200 Qty.)"]]]),
  ...C("Trash Bags", 40, [
    [
      "House / Outdoor / Leaf",
      ["15 - 18 Gallon, 1 ML, 250/box (white)", "33 Gallon, 1.25 ML, 150/box (black)", "55-60 Gallon, 1.25 ML, 100/box"],
    ],
  ]),
];

// Formats as the user types: (812) 555-0101. Accepts any pasted format; drops a leading US "1".
export function formatPhone(value) {
  let d = String(value ?? "").replace(/\D/g, "");
  if (d.length === 11 && d[0] === "1") d = d.slice(1);
  d = d.slice(0, 10);
  if (d.length <= 3) return d.length ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}
