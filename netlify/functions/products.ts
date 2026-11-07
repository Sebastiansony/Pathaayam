import type { Config } from "@netlify/functions";
import { asc, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { products, type Weight } from "../../db/schema.js";
import { json, readBody, serverError, verifyAdmin } from "./_lib/auth.js";

// Weight tiers are always stored as an ARRAY of { label, price } objects.
function sanitizeWeights(weights: unknown): Weight[] {
  if (!Array.isArray(weights)) throw new Error("Weights must be an array of { label, price }");
  const cleaned = weights
    .map((w) => ({ label: String(w?.label ?? "").trim(), price: Number(w?.price) }))
    .filter((w) => w.label);
  if (!cleaned.length) throw new Error("Add at least one weight tier");
  const seen = new Set<string>();
  for (const w of cleaned) {
    if (!Number.isFinite(w.price) || w.price <= 0) throw new Error(`Invalid price for "${w.label}"`);
    const k = w.label.toLowerCase();
    if (seen.has(k)) throw new Error(`Duplicate weight label "${w.label}"`);
    seen.add(k);
    w.price = Math.round(w.price * 100) / 100;
  }
  return cleaned;
}

const opt = (v: unknown) => (v ? String(v).trim() : null);

function buildRow(body: Record<string, any>) {
  const name = String(body.name ?? "").trim();
  if (!name) throw new Error("Product name is required");
  return {
    name,
    tagline: opt(body.tagline),
    description: opt(body.description),
    image_url: opt(body.image_url),
    category: opt(body.category),
    badge: opt(body.badge),
    weights: sanitizeWeights(body.weights),
    in_stock: body.in_stock !== false,
    sort_order: Number.isFinite(Number(body.sort_order)) ? Number(body.sort_order) : 0,
  };
}

export default async (req: Request) => {
  try {
    if (req.method === "GET") {
      const rows = await db.select().from(products).orderBy(asc(products.sort_order), asc(products.id));
      return json(rows);
    }

    if (!(await verifyAdmin(req))) return json({ error: "Admin session required" }, 401);
    const body = await readBody(req);

    if (req.method === "POST") {
      let row;
      try { row = buildRow(body); } catch (e) { return json({ error: (e as Error).message }, 400); }
      const [data] = await db.insert(products).values(row).returning();
      return json(data, 201);
    }

    if (req.method === "PUT") {
      const id = Number(body.id);
      if (!id) return json({ error: "Product id is required" }, 400);
      let row;
      try { row = buildRow(body); } catch (e) { return json({ error: (e as Error).message }, 400); }
      const [data] = await db.update(products).set({ ...row, updated_at: new Date() }).where(eq(products.id, id)).returning();
      if (!data) return json({ error: "Product not found" }, 404);
      return json(data);
    }

    if (req.method === "DELETE") {
      const id = Number(body.id || new URL(req.url).searchParams.get("id"));
      if (!id) return json({ error: "Product id is required" }, 400);
      await db.delete(products).where(eq(products.id, id));
      return json({ ok: true });
    }

    return json({ error: "Method not allowed" }, 405);
  } catch (err) {
    return serverError(err);
  }
};

export const config: Config = { path: "/api/products" };
