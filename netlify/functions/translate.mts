import type { Config } from "@netlify/functions";
import { translateWithAI } from "./lib/ai.js";

const VULAVULA_URL = "https://vulavula-services.lelapa.ai/api/v1/translate/process";
const VULAVULA_LANGUAGES: Record<string, string> = {
  english: "eng_Latn",
  zulu: "zul_Latn",
  afrikaans: "afr_Latn",
};

async function tryVulavula(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string
): Promise<string | null> {
  const sourceCode = VULAVULA_LANGUAGES[sourceLang.toLowerCase()];
  const targetCode = VULAVULA_LANGUAGES[targetLang.toLowerCase()];
  if (!sourceCode || !targetCode) return null;

  try {
    const res = await fetch(VULAVULA_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CLIENT-TOKEN": apiKey,
      },
      body: JSON.stringify({
        input_text: text,
        source_lang: sourceCode,
        target_lang: targetCode,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.translation || null;
  } catch {
    return null;
  }
}

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const body = await req.json();
    const rawText = body.text || body.input_text;
    if (!rawText || typeof rawText !== "string") {
      return Response.json(
        { error: "Missing required text field ('text' or 'input_text')" },
        { status: 400 }
      );
    }

    let sourceLang = body.source_lang || "english";
    let targetLang = body.target_lang || "";
    let languageMode = body.language_mode || "";

    if (!targetLang && languageMode) {
      if (languageMode.includes("zu")) {
        targetLang = "zulu";
      } else if (languageMode.includes("af")) {
        targetLang = "afrikaans";
      }
    }

    if (!targetLang) {
      targetLang = "zulu";
    }

    if (!languageMode) {
      languageMode = targetLang.toLowerCase().startsWith("af") ? "en-af" : "en-zu";
    }

    const humanTargetLang = targetLang.toLowerCase().includes("af") ? "Afrikaans" : "isiZulu";
    const humanSourceLang = "English";

    let translation: string | null = null;
    const vulavulaKey = process.env.VULAVULA_API_KEY;

    if (vulavulaKey) {
      const normalizedTarget = targetLang.toLowerCase().includes("af") ? "afrikaans" : "zulu";
      translation = await tryVulavula(rawText, "english", normalizedTarget, vulavulaKey);
    }

    if (!translation) {
      translation = await translateWithAI(rawText, humanSourceLang, humanTargetLang);
    }

    return Response.json({
      original_text: rawText,
      translated_text: translation,
      translation: translation,
      source_lang: sourceLang,
      target_lang: targetLang,
      language_mode: languageMode,
    });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Internal server error during translation" },
      { status: 500 }
    );
  }
};

export const config: Config = {
  path: "/api/translate",
};
