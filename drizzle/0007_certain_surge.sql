CREATE TYPE "public"."news_author" AS ENUM('lea-moreau', 'thomas-ferrand', 'ines-bakri');--> statement-breakpoint
ALTER TABLE "news_article" ADD COLUMN "author" "news_author";--> statement-breakpoint
-- Articles already published: signed by the author of their category (src/config/authors.ts)
UPDATE "news_article" SET "author" = CASE "category"
	WHEN 'sortie' THEN 'lea-moreau'::"news_author"
	WHEN 'annonce' THEN 'lea-moreau'::"news_author"
	WHEN 'materiel' THEN 'thomas-ferrand'::"news_author"
	WHEN 'industrie' THEN 'thomas-ferrand'::"news_author"
	ELSE 'ines-bakri'::"news_author"
END;--> statement-breakpoint
ALTER TABLE "news_article" ALTER COLUMN "author" SET NOT NULL;
