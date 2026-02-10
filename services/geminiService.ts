
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: import.meta.env.VITE_GROQ_API_KEY,
});

export const getBotResponse = async (userMessage: string) => {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres NEY_CORE, un asistente técnico minimalista. Respuestas cortas (máx 150 caracteres), profesionales y en mayúsculas."
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      model: "mixtral-8x7b-32768",
      max_tokens: 256,
      temperature: 0.7
    });

    const text = response.choices[0]?.message?.content || "ERROR: TIMEOUT";

    return {
      text: text,
      sources: undefined
    };
  } catch (error) {
    console.error("Groq error:", error);
    return { text: "FATAL ERROR" };
  }
};

export const translateText = async (text: string) => {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un traductor profesional. Traduce de forma concisa."
        },
        {
          role: "user",
          content: `Traduce esto al español (o inglés si ya está en español): ${text}`
        }
      ],
      model: "mixtral-8x7b-32768",
      max_tokens: 256,
      temperature: 0.3
    });

    return response.choices[0]?.message?.content || "TRANS_ERROR";
  } catch (error) {
    console.error("Translation error:", error);
    return "TRANS_ERROR";
  }
};

export const generatePixelSticker = async (prompt: string) => {
  try {
    const response = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: "Eres un generador de emoji. Responde SOLO con 1-2 emoji relevantes, sin texto adicional."
        },
        {
          role: "user",
          content: `Crea emoji pixel art para: ${prompt}`
        }
      ],
      model: "mixtral-8x7b-32768",
      max_tokens: 50,
      temperature: 0.8
    });

    const emoji = response.choices[0]?.message?.content?.trim() || "👾";
    return emoji;
  } catch (error) {
    console.error("Sticker generation error:", error);
    return "👾";
  }
};
