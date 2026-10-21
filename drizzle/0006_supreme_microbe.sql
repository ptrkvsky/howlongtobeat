CREATE TYPE "public"."news_category" AS ENUM('sortie', 'mise-a-jour', 'annonce', 'materiel', 'industrie', 'promo', 'autre');--> statement-breakpoint
CREATE TABLE "news_article" (
	"id" serial PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"source_key" text NOT NULL,
	"source_url" text NOT NULL,
	"title" text NOT NULL,
	"excerpt" text NOT NULL,
	"content_html" text NOT NULL,
	"category" "news_category" NOT NULL,
	"image" jsonb NOT NULL,
	"game_id" integer,
	"is_published" boolean DEFAULT true NOT NULL,
	"published_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "news_article_slug_unique" UNIQUE("slug"),
	CONSTRAINT "news_article_source_key_unique" UNIQUE("source_key")
);
--> statement-breakpoint
ALTER TABLE "news_article" ADD CONSTRAINT "news_article_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE set null ON UPDATE no action;