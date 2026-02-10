
import { GoogleGenAI } from "@google/genai";

export const getBotResponse = async (userMessage: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: userMessage,
      config: {
        systemInstruction: "Eres NEY_CORE, un asistente técnico minimalista. Respuestas cortas, profesionales y en mayúsculas.",
        tools: [{ googleSearch: {} }]
      },
    });

    const sources = response.candidates?.[0]?.groundingMetadata?.groundingChunks
      ?.filter(chunk => chunk.web)
      .map(chunk => ({
        title: chunk.web?.title || 'Source',
        uri: chunk.web?.uri || ''
      })) || [];

    return {
      text: response.text || "ERROR: TIMEOUT",
      sources: sources.length > 0 ? sources : undefined
    };
  } catch (error) {
    return { text: "FATAL ERROR" };
  }
};

export const translateText = async (text: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Traduce esto al español (o inglés si ya está en español) de forma profesional y corta: ${text}`,
    });
    return response.text;
  } catch {
    return "TRANS_ERROR";
  }
};

export const generatePixelSticker = async (prompt: string) => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: `Minimalist 1-bit style pixel icon, black and white, small scale: ${prompt}` }]
      },
      config: { imageConfig: { aspectRatio: "1:1" } }
    });
    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
    }
    return null;
  } catch {
    return null;
  }
};
