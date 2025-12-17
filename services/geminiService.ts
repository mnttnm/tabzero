import { GoogleGenAI } from "@google/genai";
import { TabData } from "../types";
import { getApiKey } from "./settingsService";

export const summarizeTab = async (tab: TabData): Promise<string> => {
  const apiKey = await getApiKey();

  if (!apiKey) {
    throw new Error("MISSING_API_KEY");
  }

  const ai = new GoogleGenAI({ apiKey });

  try {
    const prompt = `
      Please summarize the following webpage content in 2-3 concise sentences.
      Focus on the main value proposition or key takeaways.
      
      Title: ${tab.title}
      URL: ${tab.url}
      
      (Note: Since I cannot access the live page body content directly in this strict environment, infer the summary from the title and URL context as best as possible, or provide a general description of what this page typically contains.)
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text as string || "No summary generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    throw error; // Re-throw so UI can handle it if needed, or fallback
  }
};
