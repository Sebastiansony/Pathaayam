import type { Config } from "@netlify/functions";
import { sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { settings } from "../../db/schema.js";
import { json, readBody, serverError, verifyAdmin } from "./_lib/auth.js";

const ALLOWED = [
  "announcement",
  "hero_eyebrow",
  "hero_headline",
  "hero_intro",
  "whatsapp_number",
  "instagram_handle",
  "contact_email",
  "footer_note",
];

async function readAll() {
  const rows = await db.select().from(settings);
  const out: Record<string, string> = {};
  for (const r of rows) out[r.key] = r.value ?? "";
  return out;
}

export default async (req: Request) => {
  try {
    if (req.method === "GET") return json(await readAll());

    if (req.method === "PUT") {
      if (!(await verifyAdmin(req))) return json({ error: "Admin session required" }, 401);
      const incoming: Record<string, unknown> = (await readBody(req)).settings || {};
      const rows = Object.entries(incoming)
        .filter(([k]) => ALLOWED.includes(k))
        .map(([key, value]) => ({ key, value: String(value ?? "").trim(), updated_at: new Date() }));
      if (!rows.length) return json({ error: "No valid settings provided" }, 400);

      if (incoming.whatsapp_number !== undefined) {
        const digits = String(incoming.whatsapp_number).replace(/\D/g, "");
        if (digits && (digits.length < 10 || digits.length > 15)) {
          return json({ error: "WhatsApp number must include country code (10–15 digits)" }, 400);
        }
        rows.find((r) => r.key === "whatsapp_number")!.value = digits;
      }
      if (incoming.instagram_handle !== undefined) {
        rows.find((r) => r.key === "instagram_handle")!.value = String(incoming.instagram_handle).trim().replace(/^@/, "");
      }

      await db
        .insert(settings)
        .values(rows)
        .onConflictDoUpdate({
          target: settings.key,
          set: { value: sql`excluded.value`, updated_at: sql`excluded.updated_at` },
        });
      return json(await readAll());
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    return serverError(err);
  }
};

export const config: Config = { path: "/api/settings" };
