import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const glossaryTerms = pgTable("glossary_terms", {
  id: serial("id").primaryKey(),
  englishTerm: text("english_term").notNull(),
  isizuluWording: text("isizulu_wording").notNull(),
  afrikaansWording: text("afrikaans_wording").notNull(),
  definition: text("definition").notNull(),
  example: text("example"),
  status: text("status").notNull().default("approved"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const termSuggestions = pgTable("term_suggestions", {
  id: serial("id").primaryKey(),
  suggestedEquivalent: text("suggested_equivalent").notNull(),
  language: text("language").notNull(),
  reasonOrExample: text("reason_or_example"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usageEvents = pgTable("usage_events", {
  id: serial("id").primaryKey(),
  eventType: text("event_type").notNull(),
  payload: text("payload"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const feedback = pgTable("feedback", {
  id: serial("id").primaryKey(),
  rating: text("rating"),
  comments: text("comments"),
  createdAt: timestamp("created_at").defaultNow(),
});
