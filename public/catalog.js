// Single source of truth for the order form: used by the web page AND the server functions.
// Product order here = column order on the PDF form. Do not reorder without regenerating the PDF template.

export const site = {
  title: "MMP Laundry Fundraiser",
  // Every order is credited to this seller (shown on the page and printed on the PDF).
  seller: "Aletha Poag",
  // Shown on the order confirmation screen (tap-to-call links).
  contacts: [
    { name: "Brent", phone: "8125894513" },
    { name: "Laura", phone: "8122029195" },
  ],
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

// How the order page presents the products. `groups` must match the `group` text above.
// Image files live in /img (cropped from the vendor flyer). Presentation only: product order,
// prices and PDF columns all come from `products`.
const TIDE = "5 Gallon Liquid Tide (comparable, pump included)";
const GAIN = "5 Gallon Liquid Gain (comparable, pump included)";
const SOFT = "Comparable to Downy or Gain (pump included)";

export const sections = [
  {
    id: "detergent", title: "Liquid Laundry Detergent", chip: "Detergent", image: "/img/detergent.jpg",
    blurb: "5-gallon liquid laundry detergent with pump included. Lasts up to 500 loads per unit!",
    groups: [{ group: TIDE, label: "Comparable to Tide" }, { group: GAIN, label: "Comparable to Gain" }],
  },
  {
    id: "softener", title: "Fabric Softener", chip: "Softener", image: "/img/detergent.jpg",
    blurb: "5-gallon fabric softener with pump included. Lasts up to 500 loads per unit!",
    groups: [{ group: SOFT, label: "Comparable to Downy or Gain" }],
  },
  {
    id: "stain", title: "Powder Stain Lifter", chip: "Stain Lifter", image: null,
    blurb: "Oxy powder stain lifter in a 1 gallon pail with scoop.",
    groups: [{ group: "Powder Stain Lifter", label: "" }],
  },
  {
    id: "sheets", title: "Dissolving Laundry Sheets", chip: "Sheets", image: "/img/sheets.jpg",
    blurb: "Our newest product! Eco-friendly and light-weight. 520 sheets infused with soap that dissolve in your washing machine.",
    groups: [{ group: "ECO Friendly Laundry Detergent Sheets", label: "" }],
  },
  {
    id: "paks", title: "Laundry Paks", chip: "Laundry Paks", image: "/img/paks.jpg",
    blurb: "Packaged 225 paks per pail. You'll save 35% over retail prices!",
    groups: [{ group: "Liquid PAKS", label: "" }],
  },
  {
    id: "beads", title: "Scent Beads", chip: "Scent Beads", image: "/img/beads.jpg",
    blurb: "Concentrated scent beads boost the clean laundry smell to help keep your clothes smelling fresh for weeks after washing!",
    groups: [{ group: "Beads", label: "" }],
  },
  {
    id: "dishsoap", title: "Dish Soap", chip: "Dish Soap", image: "/img/detergent.jpg",
    blurb: "Liquid dish soap in a 5 gallon pail with antibacterial pump.",
    groups: [{ group: "Liquid 5 Gal", label: "" }],
  },
  {
    id: "dishpaks", title: "Dish Paks", chip: "Dish Paks", image: "/img/dishpaks.jpg",
    blurb: "Our liquid dish paks are tough on grease and grime! Every pail contains 200 paks.",
    groups: [{ group: "Gel", label: "" }],
  },
  {
    id: "trash", title: "Trash Bags", chip: "Trash Bags", image: "/img/trash.jpg",
    blurb: "Three sizes, suitable for office, kitchen, and leaf. There's a size for every need! Made in USA.",
    groups: [{ group: "House / Outdoor / Leaf", label: "" }],
  },
];

// "5 Gallon Liquid Tide (comparable, pump included)" -> "5 Gallon Liquid Tide"
export const shortGroup = (g) => String(g).replace(/\s*\(.*?\)\s*/g, " ").trim();
