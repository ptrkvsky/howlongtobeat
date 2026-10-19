CREATE TYPE "public"."game_source" AS ENUM('legacy', 'import');--> statement-breakpoint
ALTER TABLE "game" ADD COLUMN "source" "game_source" DEFAULT 'legacy' NOT NULL;