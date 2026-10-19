CREATE TABLE "game" (
	"id" serial PRIMARY KEY NOT NULL,
	"sanity_id" text,
	"hltb_id" integer NOT NULL,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"cover" text,
	"rating" integer,
	"time_main_story" integer DEFAULT 0 NOT NULL,
	"time_main_extras" integer DEFAULT 0 NOT NULL,
	"time_completionists" integer DEFAULT 0 NOT NULL,
	"description_md" text DEFAULT '' NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"first_release_date" date,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_sanity_id_unique" UNIQUE("sanity_id"),
	CONSTRAINT "game_hltb_id_unique" UNIQUE("hltb_id"),
	CONSTRAINT "game_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "game_genre" (
	"game_id" integer NOT NULL,
	"genre_id" integer NOT NULL,
	CONSTRAINT "game_genre_game_id_genre_id_pk" PRIMARY KEY("game_id","genre_id")
);
--> statement-breakpoint
CREATE TABLE "game_override" (
	"game_id" integer NOT NULL,
	"field" text NOT NULL,
	"value" jsonb NOT NULL,
	"note" text,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "game_override_game_id_field_pk" PRIMARY KEY("game_id","field")
);
--> statement-breakpoint
CREATE TABLE "genre" (
	"id" serial PRIMARY KEY NOT NULL,
	"sanity_id" text,
	"name" text NOT NULL,
	"slug" text NOT NULL,
	"description" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "genre_sanity_id_unique" UNIQUE("sanity_id"),
	CONSTRAINT "genre_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
ALTER TABLE "game_genre" ADD CONSTRAINT "game_genre_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_genre" ADD CONSTRAINT "game_genre_genre_id_genre_id_fk" FOREIGN KEY ("genre_id") REFERENCES "public"."genre"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_override" ADD CONSTRAINT "game_override_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;