import type { Config } from "@netlify/functions";
import { getGenAIClient, translateWithAI } from "./lib/ai.js";

export default async (req: Request) => {
  if (req.method !== "POST") {
    return Response.json({ error: "Method not allowed" }, { status: 405 });
  }

  try {
    const contentType = req.headers.get("content-type") || "";
    let extractedText = "";
    let filename = "uploaded-file.txt";
    let languageMode = "en-zu";
    let targetLang = "isiZulu";

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return Response.json({ error: "No file part in the request" }, { status: 400 });
      }

      filename = file.name || "uploaded_file";
      languageMode = (formData.get("language_mode") as string) || "en-zu";
      targetLang = languageMode.includes("af") ? "Afrikaans" : "isiZulu";

      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (filename.toLowerCase().endsWith(".txt")) {
        extractedText = buffer.toString("utf-8").trim();
      } else if (filename.toLowerCase().endsWith(".pdf")) {
        // Use Gemini 2.5 Flash to extract text accurately from PDF document
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              inlineData: {
                data: buffer.toString("base64"),
                mimeType: "application/pdf",
              },
            },
            {
              text: "Extract all readable text from this document verbatim. Return only the extracted text without any summaries or comments.",
            },
          ],
        });
        extractedText = (response.text || "").trim();
      } else if (filename.toLowerCase().endsWith(".docx")) {
        // For docx or other formats, extract text via Gemini document understanding
        const ai = getGenAIClient();
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents: [
            {
              inlineData: {
                data: buffer.toString("base64"),
                mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
              },
            },
            {
              text: "Extract all readable text from this document verbatim. Return only the extracted text without any summaries or comments.",
            },
          ],
        });
        extractedText = (response.text || "").trim();
      } else {
        // Fallback: decode text
        extractedText = buffer.toString("utf-8").trim();
      }
    } else {
      const body = await req.json();
      extractedText = (body.text || body.extracted_text || "").trim();
      filename = body.filename || "sample.txt";
      languageMode = body.language_mode || "en-zu";
      targetLang = languageMode.includes("af") ? "Afrikaans" : "isiZulu";
    }

    if (!extractedText) {
      return Response.json(
        { error: "Could not extract any text from the uploaded file." },
        { status: 400 }
      );
    }

    const translatedText = await translateWithAI(extractedText, "English", targetLang);

    return Response.json({
      filename,
      extracted_text: extractedText,
      translated_text: translatedText,
      translation: translatedText,
      language_mode: languageMode,
    });
  } catch (err: any) {
    return Response.json(
      { error: err?.message || "File upload translation failed" },
      { status: 500 }
    );
  }
};

export const config: Config = {
  path: "/api/upload-translate",
};
