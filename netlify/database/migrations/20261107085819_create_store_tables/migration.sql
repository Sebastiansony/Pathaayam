CREATE TABLE "admin" (
	"id" serial PRIMARY KEY,
	"username" text NOT NULL,
	"password_hash" text NOT NULL,
	"token_secret" text NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" serial PRIMARY KEY,
	"name" text NOT NULL,
	"tagline" text,
	"description" text,
	"image_url" text,
	"category" text,
	"badge" text,
	"weights" jsonb DEFAULT '[]' NOT NULL,
	"in_stock" boolean DEFAULT true NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "settings" (
	"key" text PRIMARY KEY,
	"value" text,
	"updated_at" timestamp DEFAULT now()
);
