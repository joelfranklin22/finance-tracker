import { GoogleGenAI } from "@google/genai";
import { HttpError } from "./http.js";

// gemini-1.5-flash (used by the original project) has been retired by Google,
// so the model is configurable. Change GEMINI_MODEL in .env if you want another one.
export const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";

let client;
function getClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.startsWith("YOUR_")) {
    throw new HttpError(500, "GEMINI_API_KEY is not configured on the server");
  }
  client ??= new GoogleGenAI({ apiKey });
  return client;
}

// `contents` is a string prompt, or an array of parts: [{ inlineData }, { text }]
export async function generateText(contents) {
  const response = await getClient().models.generateContent({
    model: GEMINI_MODEL,
    contents,
  });
  return response.text;
}

export function parseJsonResponse(text) {
  const cleaned = text.replace(/```(?:json)?\n?/g, "").trim();
  return JSON.parse(cleaned);
}
