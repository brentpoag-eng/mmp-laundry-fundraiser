import { timingSafeEqual } from "node:crypto";

const same = (given, expected) => {
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  return a.length === b.length && timingSafeEqual(a, b);
};

// Admin access = request header x-admin-key must equal one of the admin keys set in the environment:
//   ADMIN_KEY          -> signs in as "Admin"
//   ADMIN_KEY_LAURA    -> signs in as "Laura"  (any ADMIN_KEY_<NAME> works)
// Returns the signed-in name, or null. Remove a variable and redeploy to revoke that person.
export function adminUser(req) {
  const given = req.headers.get("x-admin-key") || "";
  if (!given) return null;
  let found = null;
  for (const [k, v] of Object.entries(process.env)) {
    const m = /^ADMIN_KEY(?:_(.+))?$/.exec(k);
    if (!m || !v) continue;
    if (same(given, v)) {
      const name = m[1] ? m[1].charAt(0) + m[1].slice(1).toLowerCase() : "Admin";
      found = found || name; // keep scanning so timing doesn't reveal which key matched
    }
  }
  return found;
}

export const isAdmin = (req) => adminUser(req) !== null;

export const json = (data, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
