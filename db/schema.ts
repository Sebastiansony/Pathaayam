import { pgTable, serial, text, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";

export type Weight = { label: string; price: number };

export const products = pgTable("products", {
  id: serial().primaryKey(),
  name: text().notNull(),
  tagline: text(),
  description: text(),
  image_url: text("image_url"),
  category: text(),
  badge: text(),
  weights: jsonb().$type<Weight[]>().notNull().default([]),
  in_stock: boolean("in_stock").notNull().default(true),
  sort_order: integer("sort_order").notNull().default(0),
  created_at: timestamp("created_at").defaultNow(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const settings = pgTable("settings", {
  key: text().primaryKey(),
  value: text(),
  updated_at: timestamp("updated_at").defaultNow(),
});

export const admin = pgTable("admin", {
  id: serial().primaryKey(),
  username: text().notNull(),
  password_hash: text("password_hash").notNull(),
  token_secret: text("token_secret").notNull(),
  created_at: timestamp("created_at").defaultNow(),
});
