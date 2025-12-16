import { GoogleGenAI } from "@google/genai";
import { TabData } from "../types";

// In a real extension, this should be user-configurable or fetched from a secure backend.
// For this demo, we assume the environment variable is set during build.
const API_KEY = process.env.API_KEY || ''; 

let ai: GoogleGenAI | null = null;

if (API_KEY) {
  ai = new GoogleGenAI({ apiKey: API_KEY });
}

export const summarizeTab = async (tab: TabData): Promise<string> => {
  if (!ai) {
    return "API Key missing. Please configure your Gemini API Key.";
  }

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

    return response.text || "No summary generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Failed to generate summary. Please try again.";
  }
};
