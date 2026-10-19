CREATE TABLE "itad_price" (
	"game_id" integer PRIMARY KEY NOT NULL,
	"app_id" integer NOT NULL,
	"current" double precision NOT NULL,
	"shop" text NOT NULL,
	"url" text,
	"lowest" double precision,
	"lowest_shop" text,
	"currency" text NOT NULL,
	"fetched_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "itad_price" ADD CONSTRAINT "itad_price_game_id_game_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."game"("id") ON DELETE cascade ON UPDATE no action;