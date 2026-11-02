import { timingSafeEqual } from "node:crypto";

// Admin access = request header x-admin-key must equal the ADMIN_KEY environment variable.
export function isAdmin(req) {
  const expected = process.env.ADMIN_KEY || "";
  const given = req.headers.get("x-admin-key") || "";
  if (!expected || !given) return false;
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
}

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
