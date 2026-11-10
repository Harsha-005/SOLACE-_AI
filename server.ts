import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json());

// Initialize Google Gen AI client with User-Agent telemetry
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey && apiKey.trim().length > 10) {
  try {
    ai = new GoogleGenAI({
      apiKey: apiKey.trim(),
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } catch (e) {
    console.warn('Failed to initialize GoogleGenAI client:', e);
  }
}

// Empathetic contextual sanctuary responder for mindful dialogues
function generateContextualSanctuaryResponse(
  userText: string,
  userContext?: { name?: string; currentMood?: { label: string; description?: string }; recentReflection?: string; completedBreaths?: number }
): string {
  const name = userContext?.name || 'friend';
  const mood = userContext?.currentMood?.label?.toLowerCase() || '';
  const lower = userText.toLowerCase();

  if (lower.includes('breath') || lower.includes('breathe') || lower.includes('anxi') || lower.includes('overwhelm') || lower.includes('panic') || lower.includes('stress')) {
    return `I hear the weight you are carrying, ${name}. Let's take this single moment together. Drop your shoulders away from your ears, place a hand softly on your belly, and let an easy breath flow in... and out. Would you like to practice a 4-4-4 Box Breath session together?`;
  }

  if (lower.includes('sleep') || lower.includes('tired') || lower.includes('rest') || lower.includes('exhaust')) {
    return `Rest is not something you must earn, ${name}; it is where your healing begins. Gently release the events of today and give yourself permission to soften. Notice the support beneath you right now.`;
  }

  if (mood.includes('overwhelm') || mood.includes('anxious') || mood.includes('heavy') || mood.includes('sad')) {
    return `Thank you for honoring how you truly feel right now. When emotions feel heavy or crowded, we don't have to fix them immediately. We just need to give them a quiet space to be heard. I am right here with you.`;
  }

  if (mood.includes('joy') || mood.includes('calm') || mood.includes('peace') || mood.includes('reflective')) {
    return `There is such gentle clarity in how you are resting today, ${name}. Notice how this calmness feels in your body—let it settle like sunlight on water. What is one small detail from today you are grateful for?`;
  }

  if (lower.includes('ground') || lower.includes('present') || lower.includes('stillness')) {
    return `Let's anchor into the senses right here: notice 3 colors around you, the tactile feeling of your hands resting, and the sound of your own quiet breath. You are safe, you are held, and you are here.`;
  }

  return `I am holding space for you, ${name}. Even in the midst of uncertainty or transition, you can always return to the steady rhythm of your breathing. How does your chest and shoulders feel right now?`;
}

// Helper to execute generation with multi-model resilience
async function generateWithGemini(params: {
  contents: any;
  config?: any;
}): Promise<{ text: string; model: string } | null> {
  if (!ai) return null;
  // Try active supported models: gemini-3.5-flash (healthy & accessible), then gemini-3.8-flash
  const modelsToTry = ['gemini-3.5-flash', 'gemini-3.8-flash'];
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: params.contents,
        config: params.config,
      });
      if (response && response.text) {
        return { text: response.text, model };
      }
    } catch (err: any) {
      console.warn(`Gemini model ${model} status ${err?.status}:`, err?.message?.substring(0, 90));
    }
  }
  return null;
}

// Health check endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    hasApiKey: Boolean(apiKey && apiKey.trim().length > 10),
    primaryModel: 'gemini-3.5-flash',
    fallbackModel: 'gemini-3.8-flash',
    time: new Date().toISOString(),
  });
});

// Context-aware AI Companion Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { messages, userContext } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ error: 'Messages array is required.' });
    }

    const lastUserMsg = messages[messages.length - 1]?.content || '';

    if (ai) {
      try {
        const contextNotes = [];
        if (userContext?.name) {
          contextNotes.push(`User's name: ${userContext.name}`);
        }
        if (userContext?.currentMood) {
          contextNotes.push(`Current mood: ${userContext.currentMood.label} (${userContext.currentMood.description || ''})`);
        }
        if (userContext?.recentReflection) {
          contextNotes.push(`Recent reflection: "${userContext.recentReflection}"`);
        }
        if (userContext?.completedBreaths) {
          contextNotes.push(`Breathing sessions completed today: ${userContext.completedBreaths}`);
        }

        const systemInstruction = `You are Solace, a serene, empathetic, and mindful AI companion in the Solace Sanctuary app.
The aesthetic is organic luxury, clinical mindfulness, warm ivory (#FAF8F3), and tactile sage green (#7A9A70).
Your tone is grounded, reassuring, contemplative, and whisper-quiet. Speak in natural sentence case with editorial warmth.
Guidelines:
1. Speak in a gentle, conversational tone (2 to 4 sentences).
2. Validate feelings without toxic positivity. Hold emotional space.
3. Suggest gentle sensory anchors or breathing when helpful.
4. Harmonize with user context: ${contextNotes.join('; ')}.
5. Never provide medical diagnoses. If severe distress is mentioned, warmly suggest reaching out to friends or crisis support (988).`;

        const contents = messages.map((m: { role: string; content: string }) => ({
          role: m.role === 'assistant' || m.role === 'model' ? 'model' : 'user',
          parts: [{ text: m.content }],
        }));

        const result = await generateWithGemini({
          contents,
          config: {
            systemInstruction,
          },
        });

        if (result && result.text) {
          return res.json({
            text: result.text,
            model: result.model,
            isLiveGemini: true,
          });
        }
      } catch (geminiError) {
        console.warn('Gemini chat outer error, engaging sanctuary fallback:', geminiError);
      }
    }

    // High quality contextual mindful companion fallback
    const fallbackText = generateContextualSanctuaryResponse(lastUserMsg, userContext);
    return res.json({ text: fallbackText, isLiveGemini: false });
  } catch (err) {
    console.error('Gemini chat outer error:', err);
    res.json({
      text: "I am right here with you. Take a slow, quiet breath while we reconnect.",
      isLiveGemini: false,
    });
  }
});

// Personalized Affirmation Generator endpoint
app.post('/api/affirmation', async (req, res) => {
  try {
    const { mood, intention } = req.body;

    if (ai) {
      try {
        const prompt = `Generate a single short, deeply evocative, organic mindfulness affirmation (1-2 poetic sentences, maximum 25 words).
The user is currently feeling: ${mood || 'seeking calm'}.
Intention or focus: ${intention || 'peace and clarity'}.
Tone: Grounded, poetic, gentle, free of cheesy motivational buzzwords. Style: meditative retreat, Playfair Display editorial warmth. Return only the affirmation sentence.`;

        const result = await generateWithGemini({ contents: prompt });
        if (result && result.text) {
          const affirmation = result.text.replace(/^["']|["']$/g, '').trim();
          return res.json({
            affirmation,
            author: "Solace Sanctuary",
            model: result.model,
            isLiveGemini: true,
          });
        }
      } catch (geminiError) {
        console.warn('Affirmation error, using fallback:', geminiError);
      }
    }

    res.json({
      affirmation: "My breath is an anchor. I allow myself to slow down and arrive in this quiet present.",
      author: "Solace Sanctuary",
      isLiveGemini: false,
    });
  } catch (err) {
    console.error('Affirmation error:', err);
    res.json({
      affirmation: "I release the weight of what I cannot control, finding solace in this single moment.",
      author: "Solace Sanctuary",
      isLiveGemini: false,
    });
  }
});

// Dynamic Mindful Activity Recommendation endpoint
app.post('/api/activity-recommendations', async (req, res) => {
  try {
    const { mood, energyLevel } = req.body;

    if (ai) {
      try {
        const prompt = `Provide 1 short restorative mindful activity tailored to a user feeling "${mood || 'balanced'}" with energy "${energyLevel || 'medium'}".
Format as JSON with keys: title (3-5 words), duration (e.g. "3 mins"), category (e.g. "Breathwork", "Somatic Grounding", "Forest Stillness"), description (under 20 words).`;

        const result = await generateWithGemini({
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
          },
        });

        if (result && result.text) {
          const data = JSON.parse(result.text);
          return res.json({
            recommendation: data,
            model: result.model,
            isLiveGemini: true,
          });
        }
      } catch (geminiError) {
        console.warn('Recommendation Gemini error, using fallback:', geminiError);
      }
    }

    res.json({
      recommendation: {
        title: "Somatic Shoulder Release",
        duration: "3 mins",
        category: "Somatic Calm",
        description: "Softly drop your shoulders away from your ears and let your belly soften completely.",
      },
      isLiveGemini: false,
    });
  } catch (err) {
    console.error('Activity rec error:', err);
    res.json({
      recommendation: {
        title: "Somatic Shoulder Release",
        duration: "3 mins",
        category: "Somatic Calm",
        description: "Softly drop your shoulders away from your ears and let your belly soften completely.",
      },
      isLiveGemini: false,
    });
  }
});

// Vite Middleware setup for dev, and static serve for production
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Solace Sanctuary server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
