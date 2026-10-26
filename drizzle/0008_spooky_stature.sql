ALTER TABLE "game" ADD COLUMN "published_at" timestamp with time zone;--> statement-breakpoint
-- Imported games already published: their import date, the closest one known
UPDATE "game" SET "published_at" = "created_at" WHERE "source" = 'import' AND "is_published";
