CREATE TABLE "glossary_terms" (
	"id" serial PRIMARY KEY,
	"english_term" text NOT NULL,
	"isizulu_wording" text DEFAULT '' NOT NULL,
	"afrikaans_wording" text DEFAULT '' NOT NULL,
	"definition" text DEFAULT '' NOT NULL,
	"example" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "term_suggestions" (
	"id" serial PRIMARY KEY,
	"suggested_equivalent" text NOT NULL,
	"language" text NOT NULL,
	"reason_or_example" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
