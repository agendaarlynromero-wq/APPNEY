
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const getApiKey = () => {
  const key = import.meta.env.VITE_GROQ_API_KEY;
  console.log('🔑 Checking API key...');
  console.log('Key exists:', !!key);
  console.log('Key length:', key?.length || 0);
  console.log('Key starts with:', key?.substring(0, 10) || 'NONE');
  
  if (!key || key === 'undefined' || key.includes('your_')) {
    console.warn('⚠️ GROQ API KEY NO CONFIGURADA');
    return null;
  }
  return key;
};

export const getBotResponse = async (userMessage: string) => {
  console.log('🤖 getBotResponse called');
  const GROQ_API_KEY = getApiKey();
  
  if (!GROQ_API_KEY) {
    console.error('❌ No API key found');
    return { text: "❌ ERROR: API KEY NO CONFIGURADA" };
  }

  try {
    console.log('📤 Enviando request a Groq...');
    console.log('Mensaje:', userMessage);
    
    const requestBody = {
      model: "mixtral-8x7b-32768",
      messages: [
        {
          role: "system",
          content: "Responde en mayúsculas de forma breve"
        },
        {
          role: "user",
          content: userMessage
        }
      ],
      max_tokens: 150,
      temperature: 0.5
    };
    
    console.log('📋 Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody)
    });

    console.log('📨 Response status:', response.status);
    console.log('📨 Response ok:', response.ok);
    
    const data = await response.json();
    console.log('📦 Response data:', JSON.stringify(data, null, 2));
    
    if (!response.ok) {
      console.error('❌ Groq error response:', data);
      const errorMsg = data.error?.message || `ERROR ${response.status}`;
      return { text: `❌ ${errorMsg}` };
    }

    const text = data.choices?.[0]?.message?.content?.trim() || "ERROR: SIN RESPUESTA";
    console.log('✅ Response text:', text);

    return {
      text: text.toUpperCase(),
      sources: undefined
    };
  } catch (error) {
    console.error("🔥 Groq fetch error:", error);
    const errorMsg = error instanceof Error ? error.message : 'CONNECTION ERROR';
    return { text: `❌ ${errorMsg}` };
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
            content: "Eres un traductor. Responde SOLO con el texto traducido."
          },
          {
            role: "user",
            content: `Traduce al español (o inglés si ya está): ${text}`
          }
        ],
        max_tokens: 150,
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
            content: "Responde SOLO con 1-2 emoji sin explicación"
          },
          {
            role: "user",
            content: `Emoji para: ${prompt}`
          }
        ],
        max_tokens: 20,
        temperature: 0.8
      })
    });

    const data = await response.json();
    const emoji = data.choices?.[0]?.message?.content?.trim() || "👾";
    return emoji;
  } catch (error) {
    console.error("Sticker error:", error);
    return "👾";
  }
};
