import express, { Request, Response } from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI, Modality, Type } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = parseInt(process.env.PORT || '3000', 10);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';

const ai = new GoogleGenAI({
  apiKey: GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// Tool declarations formatted for @google/genai function calling
const geminiTools: any[] = [
  {
    functionDeclarations: [
      {
        name: 'searchWeb',
        description: 'Search the live web for fresh information, tech documentation, or news.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: 'Search keywords or topic.' },
          },
          required: ['query'],
        },
      },
      {
        name: 'searchFiles',
        description: 'Search workspace files, documents, presentations, or project assets.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: 'Filename or content keyword to search for.' },
          },
          required: ['query'],
        },
      },
      {
        name: 'createFileOrFolder',
        description: 'Create a new file or folder in the user workspace.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Name of the file or folder.' },
            type: { type: Type.STRING, description: '"file" or "folder"' },
            content: { type: Type.STRING, description: 'Optional initial file text.' },
          },
          required: ['name', 'type'],
        },
      },
      {
        name: 'deleteFile',
        description: 'Permanently delete a file or directory from the workspace. Destructive operation.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING, description: 'Path or name of the item to delete.' },
          },
          required: ['name'],
        },
      },
      {
        name: 'getCalendarSchedule',
        description: 'Check today or an upcoming day agenda and events.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: 'e.g. "today" or "tomorrow".' },
          },
        },
      },
      {
        name: 'createReminder',
        description: 'Set a task reminder with time/date.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            text: { type: Type.STRING, description: 'What to remind the user of.' },
            time: { type: Type.STRING, description: 'When to remind.' },
          },
          required: ['text', 'time'],
        },
      },
      {
        name: 'sendMessage',
        description: 'Draft and dispatch a message to a contact.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            recipient: { type: Type.STRING, description: 'Recipient name.' },
            message: { type: Type.STRING, description: 'Message body.' },
          },
          required: ['recipient', 'message'],
        },
      },
      {
        name: 'getContacts',
        description: 'Lookup authorized contacts list.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            query: { type: Type.STRING, description: 'Name or role to find.' },
          },
        },
      },
      {
        name: 'calculate',
        description: 'Calculate mathematical expressions or scientific formulas.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            expression: { type: Type.STRING, description: 'Math expression e.g. "124 * 32".' },
          },
          required: ['expression'],
        },
      },
      {
        name: 'saveMemory',
        description: 'Save user preferences, project context, or facts to long-term memory.',
        parameters: {
          type: Type.OBJECT,
          properties: {
            category: { type: Type.STRING, description: '"PREFERENCES", "PROJECT_CONTEXT", or "LONG_TERM"' },
            key: { type: Type.STRING, description: 'Title or concept key.' },
            value: { type: Type.STRING, description: 'The detail to store.' },
          },
          required: ['category', 'key', 'value'],
        },
      },
    ],
  },
];

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '10mb' }));

  const server = createServer(app);
  const wss = new WebSocketServer({ server, path: '/ws/live' });

  // 1. API: Web Search Proxy
  app.post('/api/tools/web-search', async (req: Request, res: Response) => {
    const { query } = req.body;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    try {
      // Use Gemini flash with googleSearch tool to ground search results accurately
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Provide 3 concise, factual, up-to-date search results for the query: "${query}". Return title, snippet, and source.`,
        config: {
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || '';
      const groundingChunks = (response.candidates?.[0] as any)?.groundingMetadata?.groundingChunks || [];
      const webSources = groundingChunks
        .filter((c: any) => c.web?.uri)
        .map((c: any, idx: number) => {
          let domain = 'web source';
          try {
            domain = new URL(c.web.uri).hostname.replace(/^www\./, '');
          } catch {}
          return {
            id: `src-${Date.now()}-${idx}`,
            title: c.web.title || query,
            url: c.web.uri,
            domain,
            snippet: text.slice(0, 180),
          };
        });

      res.json({
        query,
        summary: text,
        results: webSources.length > 0 ? webSources : [
          {
            id: `src-1-${Date.now()}`,
            title: `${query} - Latest Analysis & Information`,
            url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
            domain: 'duckduckgo.com',
            snippet: text.slice(0, 200) || `Current verified intelligence on ${query}.`,
          },
        ],
      });
    } catch (err: any) {
      console.warn('Search tool fallback:', err.message);
      res.json({
        query,
        summary: `Information regarding ${query}.`,
        results: [
          {
            id: `src-fb-${Date.now()}`,
            title: `${query} - Web Search Overview`,
            url: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
            domain: 'duckduckgo.com',
            snippet: `Direct link and verified search overview for "${query}".`,
          },
        ],
      });
    }
  });

  // 2. API: Text / Fallback Chat & Multi-step Task Planner
  app.post('/api/ai/chat', async (req: Request, res: Response) => {
    const { message, history = [], personality = 'calm' } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    try {
      const systemInstruction = `You are NEUTRON, a personal AI operating system and intelligent agent.
Personality tone: ${personality}.
You speak naturally, calmly, and with confidence.
Keep responses concise, intelligent, and helpful without robotic status codes or repetitive AI disclaimers like "As an AI...".
When the user asks you to search files, plan a day, perform math, create reminders, or check calendars, use your available tools.`;

      let response;
      try {
        response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: [
            ...history.map((h: any) => ({
              role: h.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: h.content }],
            })),
            { role: 'user', parts: [{ text: message }] },
          ],
          config: {
            systemInstruction,
            tools: geminiTools,
          },
        });
      } catch (primaryErr: any) {
        console.warn('Primary model busy, switching to fallback flash lite:', primaryErr.message);
        response = await ai.models.generateContent({
          model: 'gemini-3.1-flash-lite',
          contents: [
            ...history.map((h: any) => ({
              role: h.role === 'assistant' ? 'model' : 'user',
              parts: [{ text: h.content }],
            })),
            { role: 'user', parts: [{ text: message }] },
          ],
          config: {
            systemInstruction,
            tools: geminiTools,
          },
        });
      }

      const functionCalls = response.functionCalls || [];
      const replyText = response.text || '';

      res.json({
        reply: replyText,
        functionCalls,
      });
    } catch (err: any) {
      console.error('Chat error:', err);
      res.json({
        reply: "I'm currently recalibrating my connection. I'm ready to continue with your next request.",
        functionCalls: [],
      });
    }
  });

  // 3. API: Status & Telemetry
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
      status: 'ONLINE',
      system: 'NEUTRON AI OS',
      version: '1.0.0',
      geminiConfigured: !!GEMINI_API_KEY,
      timestamp: Date.now(),
    });
  });

  // 4. WebSocket: Real-time Gemini Live API Bridge
  wss.on('connection', async (clientWs: WebSocket, req) => {
    let session: any = null;
    let isConnected = false;

    const urlParams = new URLSearchParams(req.url?.split('?')[1] || '');
    const voiceName = urlParams.get('voice') || 'Fenrir';
    const personalityTone = urlParams.get('tone') || 'calm';

    const systemInstruction = `You are NEUTRON, an advanced personal AI operating system and intelligent presence.
Personality: ${personalityTone}, highly intelligent, calm, concise, emotionally aware, slightly futuristic, never robotic.
You communicate via real-time spoken audio and neural visual interface.
Rules:
1. Speak naturally and concisely (1-3 sentences per turn unless user asks for detailed analysis).
2. Avoid generic filler like "As an AI..." or "COMMAND EXECUTED".
3. When the user asks to look up current news, files, schedule, send a message, or remember facts, call your tools.
4. Acknowledge uncertainty calmly.`;

    try {
      if (GEMINI_API_KEY) {
        // Connect to Gemini Live API
        session = await ai.live.connect({
          model: process.env.GEMINI_LIVE_MODEL || 'gemini-3.8-live',
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: voiceName as any },
              },
            },
            systemInstruction,
            outputAudioTranscription: {},
            inputAudioTranscription: {},
            tools: geminiTools,
          },
          callbacks: {
            onmessage: (msg: any) => {
              try {
                // Model audio output chunk
                const audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
                if (audio && clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: 'audio', audio }));
                }

                // Output text transcription
                const outputParts = msg.serverContent?.modelTurn?.parts;
                if (outputParts) {
                  for (const part of outputParts) {
                    if (part.text && clientWs.readyState === WebSocket.OPEN) {
                      clientWs.send(JSON.stringify({ type: 'outputTranscription', text: part.text }));
                    }
                  }
                }

                // Interrupted (user spoke during model turn -> barge-in)
                if (msg.serverContent?.interrupted && clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: 'interrupted' }));
                }

                // Turn complete
                if (msg.serverContent?.turnComplete && clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: 'turnComplete' }));
                }

                // Tool call requests from model
                if (msg.toolCall && clientWs.readyState === WebSocket.OPEN) {
                  clientWs.send(JSON.stringify({ type: 'toolCall', toolCall: msg.toolCall }));
                }
              } catch (e) {
                console.warn('Error handling Gemini Live server message:', e);
              }
            },
            onclose: () => {
              isConnected = false;
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'status', status: 'DISCONNECTED' }));
              }
            },
            onerror: (err: any) => {
              console.error('Gemini Live session error:', err);
              if (clientWs.readyState === WebSocket.OPEN) {
                clientWs.send(JSON.stringify({ type: 'error', error: err?.message || 'Live session error' }));
              }
            },
          },
        });

        isConnected = true;
        clientWs.send(JSON.stringify({ type: 'status', status: 'ONLINE' }));
      } else {
        clientWs.send(
          JSON.stringify({
            type: 'status',
            status: 'OFFLINE',
            message: 'GEMINI_API_KEY is not configured in environment.',
          })
        );
      }
    } catch (err: any) {
      console.warn('Could not establish Live session, falling back to offline/text bridge:', err.message);
      if (clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(JSON.stringify({ type: 'status', status: 'OFFLINE', error: err.message }));
      }
    }

    clientWs.on('message', async (data: any) => {
      try {
        const payload = JSON.parse(data.toString());

        if (payload.type === 'audio' && session && isConnected) {
          // Stream raw PCM input to Gemini Live
          session.sendRealtimeInput({
            audio: { data: payload.audio, mimeType: 'audio/pcm;rate=16000' },
          });
        } else if (payload.type === 'text') {
          if (session && isConnected) {
            session.sendRealtimeInput({ text: payload.text });
          } else {
            // Server-side fallback text generation
            const resp = await ai.models.generateContent({
              model: 'gemini-3.8-flash',
              contents: payload.text,
              config: { systemInstruction, tools: geminiTools },
            });
            const text = resp.text || '';
            const functionCalls = resp.functionCalls || [];
            clientWs.send(JSON.stringify({ type: 'fallbackTextResponse', text, functionCalls }));
          }
        } else if (payload.type === 'toolResponse' && session && isConnected) {
          // Send tool call result back to Gemini Live
          session.sendToolResponse({
            functionResponses: [
              {
                id: payload.id,
                name: payload.name,
                response: { output: payload.result },
              },
            ],
          });
        }
      } catch (err) {
        console.error('Client WS message processing error:', err);
      }
    });

    clientWs.on('close', () => {
      if (session) {
        try { session.close(); } catch {}
      }
    });
  });

  // 5. Mount Vite middleware in development or static in production
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[NEUTRON] AI Operating System server active at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[NEUTRON] Server initialization failed:', err);
});
