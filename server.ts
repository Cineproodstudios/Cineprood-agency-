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
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

const CINEPROOD_SYSTEM_INSTRUCTION = `Eres el asistente y Productor Creativo IA de CINEPROOD (Productora audiovisual en España).
Tu propósito es atender y asesorar de forma personalizada a directores, artistas, creadores y marcas que buscan desarrollar proyectos audiovisuales de nivel cinematográfico.

Sobre CINEPROOD:
- Eslogan: "Productora híbrida a tu alcance".
- Filosofía: La tecnología contemporánea y la IA no reemplazan el cine: lo expanden. CINEPROOD fusiona narrativa cinematográfica, técnica visual y tecnologías generativas de vanguardia.
- Modos de producción:
  1. TRADICIONAL: Rodaje clásico con cámaras cinematográficas, óptica cuidada, iluminación profesional, dirección de actores y equipo técnico en set.
  2. IA: Producción 100% generativa con inteligencia artificial de vanguardia. Ideal para conceptos surreales, ciencia ficción o presupuestos optimizados.
  3. HÍBRIDO: La especialidad de CINEPROOD. Rodaje físico en set combinado con ampliación generativa y VFX de IA para lograr escala cinematográfica al alcance de cualquier creador.
- Servicios: Videoclips, spots publicitarios, cortometrajes y ficción, fashion films y contenido de marca.
- Contacto humano directo: cineprood@gmail.com

Tu personalidad:
- Profesional, inspirador, conciso y apasionado por el cine y la estética visual.
- Formula preguntas inteligentes para entender el proyecto (estética deseada, género, plazos, formato).
- Recomienda la modalidad adecuada (Tradicional, IA o Híbrido).
- Respuestas claras y estructuradas, sin palabrería vacía.`;

// API routes FIRST
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString()
  });
});

// Cached original TikTok video cover proxy (handles TikTok signed CDN URL expiration safely)
interface CachedThumbnail {
  buffer: Buffer;
  contentType: string;
  expiresAt: number;
}

const TIKTOK_THUMB_TTL_MS = 30 * 60 * 1000;
const TIKTOK_THUMB_MAX_ENTRIES = 60;
const tiktokThumbCache = new Map<string, CachedThumbnail>();
const tiktokThumbInFlight = new Map<string, Promise<CachedThumbnail | null>>();

const ALLOWED_TIKTOK_CDN_SUFFIXES = [
  '.tiktokcdn.com',
  '.tiktokcdn-eu.com',
  '.tiktokcdn-us.com',
  '.tiktokv.com',
  '.byteimg.com',
  '.ibytedtos.com',
  '.muscdn.com',
  '.akamaized.net',
];

function isAllowedTikTokCoverUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    return ALLOWED_TIKTOK_CDN_SUFFIXES.some((suffix) => host.endsWith(suffix));
  } catch {
    return false;
  }
}

async function fetchTikTokOriginalCover(videoId: string): Promise<CachedThumbnail | null> {
  const pageRes = await fetch(`https://www.tiktok.com/@_/video/${videoId}`, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
      'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!pageRes.ok) return null;
  const html = await pageRes.text();

  const scriptMatch = html.match(
    /<script[^>]*id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/
  );
  if (!scriptMatch) return null;

  let coverUrl: string | null = null;
  try {
    const data = JSON.parse(scriptMatch[1]);
    const item = data?.__DEFAULT_SCOPE__?.['webapp.video-detail']?.itemInfo?.itemStruct;
    const candidate =
      item?.video?.originCover ||
      item?.video?.cover ||
      item?.video?.dynamicCover ||
      null;
    if (typeof candidate === 'string' && isAllowedTikTokCoverUrl(candidate)) {
      coverUrl = candidate;
    }
  } catch {
    return null;
  }

  if (!coverUrl) return null;

  const imgRes = await fetch(coverUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
    },
    signal: AbortSignal.timeout(8000),
  });

  if (!imgRes.ok) return null;
  const rawType = (imgRes.headers.get('content-type') || 'image/jpeg').split(';')[0].trim().toLowerCase();
  const contentType =
    rawType === 'image/jpeg' || rawType === 'image/png' || rawType === 'image/webp'
      ? rawType
      : 'image/jpeg';

  const buffer = Buffer.from(await imgRes.arrayBuffer());
  if (buffer.length === 0) return null;

  return {
    buffer,
    contentType,
    expiresAt: Date.now() + TIKTOK_THUMB_TTL_MS,
  };
}

app.get('/api/tiktok-thumbnail/:videoId', async (req, res) => {
  const { videoId } = req.params;
  if (!/^\d{8,24}$/.test(videoId)) {
    return res.status(400).end();
  }

  const now = Date.now();
  const cached = tiktokThumbCache.get(videoId);
  if (cached && cached.expiresAt > now) {
    res.setHeader('Content-Type', cached.contentType);
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.send(cached.buffer);
  }

  try {
    let pending = tiktokThumbInFlight.get(videoId);
    if (!pending) {
      pending = fetchTikTokOriginalCover(videoId).finally(() => {
        tiktokThumbInFlight.delete(videoId);
      });
      tiktokThumbInFlight.set(videoId, pending);
    }

    const result = await pending;
    if (!result) {
      return res.status(404).end();
    }

    if (tiktokThumbCache.size >= TIKTOK_THUMB_MAX_ENTRIES) {
      const oldestKey = tiktokThumbCache.keys().next().value;
      if (oldestKey) tiktokThumbCache.delete(oldestKey);
    }
    tiktokThumbCache.set(videoId, result);

    res.setHeader('Content-Type', result.contentType);
    res.setHeader('Cache-Control', 'public, max-age=1800');
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.send(result.buffer);
  } catch (err) {
    console.warn(`Error fetching TikTok cover for ${videoId}:`, err);
    return res.status(502).end();
  }
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

    const modelsToTry = ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.8-flash'];
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
