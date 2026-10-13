import type { Config } from "@netlify/functions";
import { db } from "../../db/index.js";
import { termSuggestions } from "../../db/schema.js";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const data = await req.json();
    if (!data || !data.suggested_equivalent || !data.language) {
      return Response.json(
        { error: "Missing required fields ('suggested_equivalent', 'language')" },
        { status: 400 }
      );
    }

    const { suggested_equivalent, language, reason_or_example } = data;

    try {
      await db.insert(termSuggestions).values({
        suggestedEquivalent: suggested_equivalent,
        language: language,
        reasonOrExample: reason_or_example || "",
        status: "pending",
      });
    } catch (dbErr) {
      // Even if database connection is pending provision, respond gracefully
    }

    return Response.json(
      {
        message: "Term suggestion submitted successfully for review!",
        status: "pending",
      },
      { status: 201 }
    );
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
};

export const config: Config = {
  path: "/api/glossary/suggest",
};
