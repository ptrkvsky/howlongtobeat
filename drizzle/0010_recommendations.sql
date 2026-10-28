CREATE TABLE "game_embedding" (
	"game_id" integer PRIMARY KEY NOT NULL,
	"model" text NOT NULL,
	"doc_hash" text NOT NULL,
	"document" text NOT NULL,
	"embedding" vector(512) NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_recommendation" (
	"game_id" integer NOT NULL,
	"rank" integer NOT NULL,
	"related_game_id" integer NOT NULL,
	"score" real NOT NULL,
	"components" jsonb NOT NULL,
	"algo_version" text NOT NULL,
	"computed_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_recommendation_game_id_rank_pk" PRIMARY KEY("game_id","rank")
);
--> statement-breakpoint
CREATE TABLE "steam_tags" (
	"game_id" integer PRIMARY KEY NOT NULL,
	"app_id" integer NOT NULL,
	"tags" jsonb NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "igdb_info" ADD COLUMN "genres" text[];--> statement-breakpoint
ALTER TABLE "igdb_info" ADD COLUMN "themes" text[];--> statement-breakpoint
ALTER TABLE "igdb_info" ADD COLUMN "keywords" text[];--> statement-breakpoint
ALTER TABLE "igdb_info" ADD COLUMN "game_modes" text[];--> statement-breakpoint
ALTER TABLE "igdb_info" ADD COLUMN "perspectives" text[];--> statement-breakpoint
ALTER TABLE "igdb_info" ADD COLUMN "franchise_ids" integer[];--> statement-breakpoint
ALTER TABLE "igdb_info" ADD COLUMN "collection_ids" integer[];--> statement-breakpoint
ALTER TABLE "igdb_info" ADD COLUMN "parent_igdb_id" integer;--> statement-breakpoint
ALTER TABLE "igdb_info" ADD COLUMN "similar_igdb_ids" integer[];--> statement-breakpoint
ALTER TABLE "game_embedding" ADD CONSTRAINT "game_embedding_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_recommendation" ADD CONSTRAINT "game_recommendation_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_recommendation" ADD CONSTRAINT "game_recommendation_related_game_id_game_id_fk" FOREIGN KEY ("related_game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "steam_tags" ADD CONSTRAINT "steam_tags_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;