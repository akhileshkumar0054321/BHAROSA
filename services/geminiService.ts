
import { GoogleGenAI, Type } from "@google/genai";

// Always use process.env.API_KEY directly for initialization as per guidelines
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getTrustInsights = async (history: any, role: string) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Analyze this ${role} data and provide a professional, elite financial insight in 2 sentences. Use a tone suitable for a high-net-worth individual. Data: ${JSON.stringify(history)}`,
      config: {
        systemInstruction: "You are the Concierge for Bharosa, a premium trust-based financial platform similar to Amex Centurion. Provide elite, sophisticated financial insights.",
        temperature: 0.7,
      },
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Our concierge is currently polishing your personalized reports. Please check back shortly.";
  }
};
