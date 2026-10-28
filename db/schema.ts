import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const glossaryTerms = pgTable('glossary_terms', {
  id: serial().primaryKey(),
  english_term: text().notNull(),
  isizulu_wording: text().notNull().default(''),
  afrikaans_wording: text().notNull().default(''),
  definition: text().notNull().default(''),
  example: text().notNull().default(''),
  status: text().notNull().default('pending'),
});

export const termSuggestions = pgTable('term_suggestions', {
  id: serial().primaryKey(),
  suggested_equivalent: text().notNull(),
  language: text().notNull(),
  reason_or_example: text().notNull().default(''),
  status: text().notNull().default('pending'),
  created_at: timestamp().notNull().defaultNow(),
});
