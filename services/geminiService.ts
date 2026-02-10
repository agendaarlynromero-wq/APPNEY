
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const getApiKey = () => {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  if (!key || key === 'undefined' || key.includes('your_')) {
    console.warn('⚠️ GROQ API KEY NO CONFIGURADA. Agrega tu clave en .env.local');
    return null;
  }
  return key;
};

export const getBotResponse = async (userMessage: string) => {
  const GROQ_API_KEY = getApiKey();
  if (!GROQ_API_KEY) {
    return { text: "❌ ERROR: API KEY NO CONFIGURADA. Verifica .env.local" };
  }

  try {
    console.log('📤 Enviando a Groq...');
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
            content: "Eres NEY_CORE, un asistente técnico minimalista. Respuestas cortas (máx 100 caracteres), profesionales y en mayúsculas."
          },
          {
            role: "user",
            content: userMessage
          }
        ],
        max_tokens: 200,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq Error:', response.status, errorText);
      return { text: `❌ ERROR_${response.status}: LA_IA_NO_RESPONDE` };
    }

    const data = await response.json();
    console.log('✅ Respuesta de Groq:', data);
    const text = data.choices?.[0]?.message?.content?.trim() || "ERROR: TIMEOUT";

    return {
      text: text.toUpperCase(),
      sources: undefined
    };
  } catch (error) {
    console.error("🔥 Groq error:", error);
    return { text: `❌ CONEXION_ERROR: ${error instanceof Error ? error.message : 'DESCONOCIDO'}` };
  }
};

export const translateText = async (text: string) => {
  const GROQ_API_KEY = getApiKey();
  if (!GROQ_API_KEY) return "❌ ERROR: API KEY";

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
            content: "Eres un traductor profesional. Responde SOLO con el texto traducido, sin explicaciones."
          },
          {
            role: "user",
            content: `Traduce al español (o inglés si ya está en español): ${text}`
          }
        ],
        max_tokens: 200,
        temperature: 0.3
      })
    });

    const data = await response.json();
    return data.choices?.[0]?.message?.content?.trim() || "TRANS_ERROR";
  } catch (error) {
    console.error("Translation error:", error);
    return "TRANS_ERROR";
  }
};

export const generatePixelSticker = async (prompt: string) => {
  const GROQ_API_KEY = getApiKey();
  if (!GROQ_API_KEY) return "👾";

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
            content: "Eres un generador de emoji. Responde SOLO con 1-2 emoji de pixel art relevantes, sin texto adicional."
          },
          {
            role: "user",
            content: `Genera emoji para: ${prompt}`
          }
        ],
        max_tokens: 30,
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
