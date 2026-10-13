CREATE TABLE "feedback" (
	"id" serial PRIMARY KEY,
	"rating" text,
	"comments" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "glossary_terms" (
	"id" serial PRIMARY KEY,
	"english_term" text NOT NULL,
	"isizulu_wording" text NOT NULL,
	"afrikaans_wording" text NOT NULL,
	"definition" text NOT NULL,
	"example" text,
	"status" text DEFAULT 'approved' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "term_suggestions" (
	"id" serial PRIMARY KEY,
	"suggested_equivalent" text NOT NULL,
	"language" text NOT NULL,
	"reason_or_example" text,
	"status" text DEFAULT 'pending' NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "usage_events" (
	"id" serial PRIMARY KEY,
	"event_type" text NOT NULL,
	"payload" text,
	"created_at" timestamp DEFAULT now()
);
