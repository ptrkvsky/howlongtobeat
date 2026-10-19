CREATE TYPE "public"."completion_status" AS ENUM('auto', 'pending', 'validated', 'rejected');--> statement-breakpoint
CREATE TYPE "public"."match_source" AS ENUM('both', 'wikidata', 'igdb');--> statement-breakpoint
CREATE TYPE "public"."match_status" AS ENUM('matched', 'conflict', 'ambiguous', 'no_steam', 'not_found', 'manual');--> statement-breakpoint
CREATE TABLE "game_external_id" (
	"game_id" integer PRIMARY KEY NOT NULL,
	"status" "match_status" NOT NULL,
	"wikidata_qid" text,
	"igdb_id" integer,
	"igdb_slug" text,
	"igdb_from" "match_source",
	"steam_app_id" integer,
	"steam_from" "match_source",
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "hltb_stats" (
	"game_id" integer PRIMARY KEY NOT NULL,
	"type" text NOT NULL,
	"count_total" integer NOT NULL,
	"count_comp" integer NOT NULL,
	"count_backlog" integer NOT NULL,
	"count_playing" integer NOT NULL,
	"count_review" integer NOT NULL,
	"review_score" integer NOT NULL,
	"comp_main_count" integer NOT NULL,
	"comp_plus_count" integer NOT NULL,
	"comp_100_count" integer NOT NULL,
	"comp_all_count" integer NOT NULL,
	"comp_main" integer NOT NULL,
	"comp_main_med" integer NOT NULL,
	"comp_plus" integer NOT NULL,
	"comp_100" integer NOT NULL,
	"steam_app_id" integer,
	"platforms" text,
	"developer" text,
	"publisher" text,
	"release_world" text,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "igdb_info" (
	"game_id" integer PRIMARY KEY NOT NULL,
	"first_release_date" date,
	"developers" text[] DEFAULT '{}' NOT NULL,
	"publishers" text[] DEFAULT '{}' NOT NULL,
	"platforms" text[] DEFAULT '{}' NOT NULL,
	"is_mature" boolean DEFAULT false NOT NULL,
	"summary_en" text,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "steam_stats" (
	"game_id" integer PRIMARY KEY NOT NULL,
	"app_id" integer NOT NULL,
	"review_positive" integer,
	"review_total" integer,
	"review_percent" integer,
	"review_desc" text,
	"achievement_count" integer,
	"rarest_name" text,
	"rarest_percent" double precision,
	"completion" jsonb,
	"completion_status" "completion_status",
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "game_external_id" ADD CONSTRAINT "game_external_id_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "hltb_stats" ADD CONSTRAINT "hltb_stats_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "igdb_info" ADD CONSTRAINT "igdb_info_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "steam_stats" ADD CONSTRAINT "steam_stats_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;