# NEY PAGER PRO - Comunicador Retro con IA

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   `npm install`

2. Obtén tu API key de Groq (GRATIS):
   - Ve a https://console.groq.com/keys
   - Crea una nueva API key
   - Establece el ambiente: `VITE_GROQ_API_KEY="your_api_key_here"`
   - O edita `.env.local` con tu clave

3. Inicia la app:
   `npm run dev`

## ¿Por qué Groq?
- ✅ **Gratis** - Sin costos de API
- ✅ **Rápido** - Inferencia ultra rápida
- ✅ **Modelos potentes** - Mixtral, Llama 3, etc.
- ✅ **Perfecto para chat** - Latencia baja

## Deploy a Vercel

1. **Conecta tu GitHub a Vercel:**
   - Ve a https://vercel.com/new
   - Importa tu repositorio
   - Selecciona el proyecto

2. **Configura variables de entorno:**
   - En Settings → Environment Variables
   - Agrega: `VITE_GROQ_API_KEY` = tu_groq_api_key

3. **Deploy automático:**
   - Vercel construirá automáticamente
   - Tu app estará disponible en `nombreapp.vercel.app`

## Features

- 💬 Chat en tiempo real con IA
- 🎨 Interfaz retro estilo pager años 90
- 🤖 Powered by Groq AI
- 📱 Totalmente responsive
- 🔊 Sonidos retro y vibraciones
- 🎤 Grabación de audio
- 📍 Geolocalización
- 🌙 Temas LCD personalizables

## Stack

- React 19 + TypeScript
- Vite (build ultrarrápido)
- Groq API (IA gratis)
- Tailwind CSS
- Storage local
