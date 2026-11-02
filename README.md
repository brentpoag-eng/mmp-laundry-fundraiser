# Fundraiser Order Site

Customers fill out `/`, orders are stored (Netlify Blobs), and `/admin.html` downloads the
paper order form filled in automatically (master PDF, per-order PDF) plus a CSV.

## Deploy (Netlify)

Functions need a real build, so drag-and-drop deploy will not work. Use either:

- **Git:** push this folder to a repo, then "Add new site > Import from Git" in Netlify, or
- **CLI:** `npm install`, then `npx netlify-cli deploy --prod` (link or create the site when asked).

## Settings (Netlify > Site configuration > Environment variables)

- `ADMIN_KEY` (required): password for `/admin.html`. Pick something long, then redeploy.

## Edit before going live

- `public/catalog.js`: set `site.payableTo` (who checks are made out to), and change products or prices.
  Product order = PDF column order. If you add/remove products, the PDF form must be rebuilt too.

## Replacing the PDF form

Put the new fillable PDF at `test/template.pdf`, run `npm run template`, redeploy.

## Test locally

`npm test` writes sample filled PDFs to `test/out-master.pdf` and `test/out-single.pdf`.
For the full site locally: `npx netlify-cli dev` (set `ADMIN_KEY` in a `.env` file).

## Notes

- Totals are recalculated on the server; the browser total is only a display.
- One PDF page = one seller, up to 20 customers. More customers continue on another page.
- "Total Paid" on the PDF is left blank for you to fill in as checks come in.
