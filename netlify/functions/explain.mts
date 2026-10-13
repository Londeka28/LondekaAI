import type { Config } from "@netlify/functions";
import { getGenAIClient } from "./lib/ai.js";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const data = await req.json();
    const term = data?.term;
    if (!term || typeof term !== "string") {
      return Response.json({ error: "Missing required 'term' parameter" }, { status: 400 });
    }

    const context = data.context || "";
    const ai = getGenAIClient();

    const prompt = `You are an educational space science tutor helping South African high school learners participating in the South African Space Design Competition (ZASDC-KZN).
For the space settlement / engineering term "${term}" (context: "${context}"), provide a JSON response with:
1. "explanation": A clear, intuitive explanation in plain English suitable for high school students.
2. "analogy": A relatable real-world or South African analogy (e.g. comparing habitat structures, power grids, or microclimates to familiar local concepts like rondavels, water reserves, solar farms, or municipal grids).
3. "isizulu_note": A brief note explaining the concept or key vocabulary in or relevant to isiZulu learners.
4. "afrikaans_note": A brief note explaining the concept or key vocabulary in or relevant to Afrikaans learners.

Return ONLY raw JSON formatted like this without markdown backticks:
{
  "explanation": "...",
  "analogy": "...",
  "isizulu_note": "...",
  "afrikaans_note": "..."
}`;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    let textResponse = (response.text || "").trim();
    // Strip markdown json fences if present
    if (textResponse.startsWith("```json")) {
      textResponse = textResponse.replace(/^```json/, "").replace(/```$/, "").trim();
    } else if (textResponse.startsWith("```")) {
      textResponse = textResponse.replace(/^```/, "").replace(/```$/, "").trim();
    }

    try {
      const parsed = JSON.parse(textResponse);
      return Response.json({
        term,
        explanation: parsed.explanation,
        analogy: parsed.analogy,
        isizulu_note: parsed.isizulu_note,
        afrikaans_note: parsed.afrikaans_note,
        source: "AI-Generated (Netlify AI Gateway)",
      });
    } catch {
      return Response.json({
        term,
        explanation: textResponse,
        analogy: "Think of this subsystem like a municipal infrastructure loop in a self-sustaining town.",
        source: "AI-Generated (Netlify AI Gateway)",
      });
    }
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "Failed to generate explanation" },
      { status: 500 }
    );
  }
};

export const config: Config = {
  path: "/api/explain",
};
