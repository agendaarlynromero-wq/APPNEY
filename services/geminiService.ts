
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

export const getBotResponse = async (userMessage: string) => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
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
        max_tokens: 256,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status}`);
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || "ERROR: TIMEOUT";

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
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
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
        max_tokens: 256,
        temperature: 0.3
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content || "TRANS_ERROR";
  } catch (error) {
    console.error("Translation error:", error);
    return "TRANS_ERROR";
  }
};

export const generatePixelSticker = async (prompt: string) => {
  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "mixtral-8x7b-32768",
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
        max_tokens: 50,
        temperature: 0.8
      })
    });

    const data = await response.json();
    const emoji = data.choices?.[0]?.message?.content?.trim() || "👾";
    return emoji;
  } catch (error) {
    console.error("Sticker generation error:", error);
    return "👾";
  }
};
