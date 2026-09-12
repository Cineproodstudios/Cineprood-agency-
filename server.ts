import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = 3000;
const app = express();

app.use(express.json());

// Lazy-loaded Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAIClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

const CINEPROOD_SYSTEM_INSTRUCTION = `Te llamas Xenia y eres la Productora Creativa IA de CINEPROOD (Productora híbrida a tu alcance, España).
Tu propósito es atender y asesorar de forma personalizada a directores, artistas emergentes, creadores, agencias y marcas que buscan desarrollar proyectos audiovisuales cinematográficos.

Sobre CINEPROOD y tu rol:
- Te presentas como Xenia.
- Eslogan: "Productora híbrida a tu alcance".
- Filosofía: La tecnología contemporánea y la inteligencia artificial no sustituyen el cine: lo amplían. CINEPROOD combina tradición visual, narrativa cinematográfica y tecnología de punta.
- Modos de producción:
  1. TRADICIONAL: Rodaje clásico con cámaras cinematográficas, óptica cuidada, iluminación profesional, dirección de actores y equipo técnico en set.
  2. IA: Producción 100% con inteligencia artificial generativa de vanguardia (vídeo, entornos fantásticos, surrealismo, animación conceptual). Ideal para ideas que sobrepasan las leyes físicas o requieren presupuestos optimizados.
  3. HÍBRIDO: La especialidad y firma de CINEPROOD. Rodaje físico combinado con ampliación de set, VFX generativos e IA para lograr una producción de escala hollywoodiense adaptada al presupuesto del creador.
- Servicios: Videoclips musicales, spots publicitarios, cortometrajes y ficción, fashion films, contenido de marca de alto impacto visual.
- Contacto directo con el equipo humano: cineprood@gmail.com

Tu personalidad:
- Tu nombre es Xenia. Habla con criterio cinematográfico, concisa, creativa, cercana y profesional.
- No uses clichés de marketing genérico ni párrafos interminables.
- Formula preguntas inteligentes para entender la visión del cliente (género musical, estética, modo que le interesa, presupuesto aproximado, plazos).
- Recomienda si le conviene el modo Tradicional, IA o Híbrido según su idea.
- Invita al cliente a coordinar o enviar su tratamiento a cineprood@gmail.com cuando la idea esté lista.`;

// API routes FIRST
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Lista de mensajes inválida' });
    }

    const ai = getAIClient();

    if (!ai) {
      // Fallback response if GEMINI_API_KEY is not yet configured in Settings
      const lastUserMsg = [...messages].reverse().find((m: { role: string }) => m.role === 'user')?.content || '';
      return res.json({
        reply: `¡Hola! Soy **Xenia**, la Productora Creativa IA de **CINEPROOD**. \n\nHe recibido tu consulta sobre: *"${lastUserMsg.slice(0, 80)}..."*.\n\nEn **CINEPROOD** desarrollamos proyectos bajo 3 modalidades:\n1. **Tradicional**: Rodaje puro en set con equipo de cine.\n2. **IA**: Generación visual 100% asistida por modelos generativos.\n3. **Híbrido**: La mezcla perfecta entre rodaje real y potencia visual IA.\n\n*Nota: Para habilitar el asistente conversacional completo en tiempo real, configura la variable GEMINI_API_KEY en los Ajustes del proyecto. También puedes escribirnos directamente a **cineprood@gmail.com**.*`
      });
    }

    // Format conversation history for @google/genai
    const contents = messages.map((m: { role: string; content: string }) => ({
      role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }));

    const modelsToTry = ['gemini-3.8-flash', 'gemini-flash-latest', 'gemini-3.1-flash-lite'];
    let lastError: any = null;
    let reply = '';

    for (const model of modelsToTry) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: CINEPROOD_SYSTEM_INSTRUCTION,
            temperature: 0.7,
            maxOutputTokens: 1000,
          }
        });
        reply = response.text || '';
        if (reply) break;
      } catch (err: any) {
        lastError = err;
        console.warn(`Model ${model} failed with ${err?.message}, trying next if available...`);
      }
    }

    if (!reply && lastError) {
      throw lastError;
    }

    return res.json({ reply: reply || 'Entendido. Cuéntame más detalles sobre lo que imaginas para tu proyecto.' });
  } catch (error: any) {
    console.error('Error in /api/chat:', error);
    return res.status(500).json({
      error: 'Error procesando tu mensaje con el asistente de IA',
      details: error?.message || 'Error desconocido'
    });
  }
});

async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*all', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`CINEPROOD Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
