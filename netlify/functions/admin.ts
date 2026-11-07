import type { Config } from "@netlify/functions";
import { eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { admin } from "../../db/schema.js";
import { ensureAdmin, hashPassword, json, makeToken, readBody, serverError, verifyAdmin } from "./_lib/auth.js";

export default async (req: Request) => {
  try {
    if (req.method === "GET") {
      if (!(await verifyAdmin(req))) return json({ error: "Session expired" }, 401);
      const row = await ensureAdmin();
      return json({ ok: true, username: row.username });
    }

    if (req.method === "POST") {
      const { action, username, password, newUsername, newPassword } = await readBody(req);

      if (action === "login") {
        if (!username || !password) return json({ error: "Username and password are required" }, 400);
        const row = await ensureAdmin();
        if (row.username !== String(username).trim() || row.password_hash !== hashPassword(String(password))) {
          return json({ error: "Invalid username or password" }, 401);
        }
        return json({ token: makeToken(row), username: row.username });
      }

      if (action === "change") {
        if (!(await verifyAdmin(req))) return json({ error: "Session expired" }, 401);
        const row = await ensureAdmin();
        if (row.password_hash !== hashPassword(String(password || ""))) {
          return json({ error: "Current password is incorrect" }, 400);
        }
        const u = String(newUsername || row.username).trim();
        if (u.length < 3) return json({ error: "Username must be at least 3 characters" }, 400);
        if (newPassword && String(newPassword).length < 4) {
          return json({ error: "New password must be at least 4 characters" }, 400);
        }
        const update: Partial<typeof admin.$inferInsert> = { username: u };
        if (newPassword) update.password_hash = hashPassword(String(newPassword));
        const [data] = await db.update(admin).set(update).where(eq(admin.id, row.id)).returning();
        return json({ token: makeToken(data), username: data.username });
      }

      return json({ error: "Unknown action" }, 400);
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    return serverError(err);
  }
};

export const config: Config = { path: "/api/admin" };
