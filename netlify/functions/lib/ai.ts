import { GoogleGenAI } from "@google/genai";

export function getGenAIClient(): GoogleGenAI {
  const apiKey =
    process.env.NETLIFY_AI_GATEWAY_KEY ||
    process.env.GEMINI_API_KEY ||
    "";
  const baseUrl = (
    process.env.NETLIFY_AI_GATEWAY_BASE_URL ||
    process.env.GOOGLE_GEMINI_BASE_URL ||
    ""
  ).replace(/\/$/, "");

  return new GoogleGenAI({
    apiKey,
    ...(baseUrl ? { httpOptions: { baseUrl } } : {}),
  });
}

export async function translateWithAI(
  inputText: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
  const ai = getGenAIClient();
  const prompt = `You are an expert translator specializing in the South African Space Design Competition (ZASDC-KZN) and aerospace terminology.
Translate the following ${sourceLang} text into ${targetLang}.
Preserve technical accuracy for space mission design, habitat structures, RFP requirements, and operations.
Ensure natural, idiomatic phrasing appropriate for high school learners and educators in South Africa.
Only provide the translated text without commentary or conversational preambles.

Text to translate:
"""${inputText}"""`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return (response.text || "").trim();
}
