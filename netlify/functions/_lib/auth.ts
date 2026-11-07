import crypto from "node:crypto";
import { asc } from "drizzle-orm";
import { db } from "../../../db/index.js";
import { admin } from "../../../db/schema.js";

export const DEFAULT_USER = "admin";
export const DEFAULT_PASS = "5787";

export type AdminRow = typeof admin.$inferSelect;

export const hashPassword = (pass: string) =>
  crypto.createHash("sha256").update(`pathaayam::${pass}`).digest("hex");

export function makeToken(row: AdminRow) {
  return crypto
    .createHmac("sha256", row.token_secret)
    .update(`${row.id}:${row.username}:${row.password_hash}`)
    .digest("hex");
}

// Auto-initialises the default admin credentials when the admin table is empty.
export async function ensureAdmin(): Promise<AdminRow> {
  const rows = await db.select().from(admin).orderBy(asc(admin.id)).limit(1);
  if (rows.length) return rows[0];
  const [created] = await db
    .insert(admin)
    .values({
      username: DEFAULT_USER,
      password_hash: hashPassword(DEFAULT_PASS),
      token_secret: crypto.randomBytes(32).toString("hex"),
    })
    .returning();
  return created;
}

export async function verifyAdmin(req: Request) {
  const token = (req.headers.get("authorization") || "").replace("Bearer ", "").trim();
  if (!token) return false;
  const expected = makeToken(await ensureAdmin());
  if (token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}

export const json = (data: unknown, status = 200) => Response.json(data, { status });

export async function readBody(req: Request): Promise<Record<string, any>> {
  try {
    return (await req.json()) || {};
  } catch {
    return {};
  }
}

export function serverError(err: unknown) {
  console.error("API error:", err);
  return json({ error: (err as Error).message || "Server error" }, 500);
}
