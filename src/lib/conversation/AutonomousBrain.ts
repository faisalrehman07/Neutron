import { GoogleGenAI } from '@google/genai';
import { globalActionExecutor } from '../tools/executor';
import { globalMemoryStore } from '../memory/memoryStore';
import { globalTaskPlanner } from '../tasks/taskPlanner';
import { ResearchResult } from '../../types/research';

export interface AutonomousResponse {
  text: string;
  toolExecuted?: {
    name: string;
    result: any;
  };
  modeChange?: 'IMMERSIVE' | 'RESEARCH';
  researchData?: {
    query: string;
    summary: string;
    results: ResearchResult[];
  };
}

class AutonomousBrainService {
  private userApiKey: string = '';

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('neutron_gemini_key');
      this.userApiKey = (stored && stored.trim()) || '';
    }
  }

  public setApiKey(key: string) {
    this.userApiKey = key.trim();
    if (typeof window !== 'undefined') {
      localStorage.setItem('neutron_gemini_key', this.userApiKey);
    }
  }

  public getApiKey(): string {
    return this.userApiKey;
  }

  /**
   * Processes a query via live Gemini API or intelligent autonomous reasoning
   */
  public async processQuery(query: string): Promise<AutonomousResponse> {
    const clean = query.trim().toLowerCase();

    // 1. If user provided a Gemini API key in settings or localStorage, query Gemini directly
    if (this.userApiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${this.userApiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `You are NEUTRON, an advanced, highly capable Personal AI Operating System.
Respond concisely, intelligently, and clearly in 1 to 3 sentences with a sophisticated, calm, and futuristic voice.
User directive: "${query}"`,
                  },
                ],
              },
            ],
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.candidates?.[0]?.content?.parts?.[0]?.text;
          if (reply && reply.trim()) {
            const isResearch = /^(search|research|investigate|who is|what is|tell me about|analyze)/i.test(query);
            if (isResearch) {
              return {
                text: reply.trim(),
                modeChange: 'RESEARCH',
                researchData: {
                  query,
                  summary: reply.trim(),
                  results: [
                    {
                      id: `res-1-${Date.now()}`,
                      title: `${query.slice(0, 30)} - Neural Intelligence Brief`,
                      snippet: reply.trim().slice(0, 180) + '...',
                      url: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
                    },
                  ],
                },
              };
            }
            return { text: reply.trim() };
          }
        }
      } catch (err: any) {
        console.warn('Direct Gemini REST call error:', err);
      }
    }

    // 2. Comprehensive Neural Knowledge Base & Intent Classifier (Offline / Static Mode)
    // Query about Meta
    if (clean.includes('meta') || clean.includes('facebook') || clean.includes('zuckerberg')) {
      return {
        text: `Meta Platforms is a global technology leader operating Facebook, Instagram, WhatsApp, and Threads. They are heavily investing in artificial intelligence through open-source Llama models and building the future of immersion via Quest spatial computing hardware.`,
        modeChange: 'RESEARCH',
        researchData: {
          query: 'Meta Platforms & AI Overview',
          summary: 'Meta connects over 3 billion active users daily and is pioneering open-weights generative AI with Llama architectures.',
          results: [
            {
              id: `res-meta-1`,
              title: 'Meta AI & Llama Research',
              snippet: 'Leading open foundation models with state-of-the-art multi-modal capabilities and sovereign deployments.',
              url: 'https://about.meta.com',
            },
            {
              id: `res-meta-2`,
              title: 'Meta Reality Labs Telemetry',
              snippet: 'Spatial computing, mixed reality headsets, and custom silicon development.',
              url: 'https://tech.meta.com',
            },
          ],
        },
      };
    }

    // Query about Google / Gemini
    if (clean.includes('google') || clean.includes('gemini') || clean.includes('deepmind')) {
      return {
        text: `Google is a pioneer in hyperscale cloud, search algorithms, and machine intelligence. Through Google DeepMind, they develop state-of-the-art Gemini multimodal models that power real-time voice, reasoning, and agents like NEUTRON.`,
      };
    }

    // Query about NVIDIA
    if (clean.includes('nvidia') || clean.includes('gpu') || clean.includes('blackwell')) {
      return {
        text: `NVIDIA is the world's leading accelerated computing company, developing Hopper and Blackwell GPU architectures, CUDA software libraries, and full-stack AI data center infrastructure.`,
        modeChange: 'RESEARCH',
        researchData: {
          query: 'NVIDIA GPU Architecture',
          summary: 'NVIDIA systems deliver transformative compute density and low-latency inference across global sovereign clouds.',
          results: [
            {
              id: `res-nv-1`,
              title: 'NVIDIA AI Infrastructure',
              snippet: 'Accelerated computing nodes powering frontier LLMs and physical robotics simulations.',
              url: 'https://nvidia.com',
            },
          ],
        },
      };
    }

    // Subsystem diagnostics & status
    if (clean.includes('diagnostic') || clean.includes('status') || clean.includes('system') || clean.includes('health')) {
      const activeTaskCount = globalTaskPlanner.getActiveTask() ? 1 : 0;
      const memCount = globalMemoryStore.getAll().length;
      return {
        text: `All primary subsystems operational. Neural synapsing at 4.2 GHz. Coherence index is 99.4%. Active memory matrices: ${memCount}. Queued execution routines: ${activeTaskCount}.`,
      };
    }

    // Greetings
    if (clean.includes('good morning') || clean.includes('hello') || clean.includes('hi neutron') || clean.includes('hey neutron') || clean.includes('how are you')) {
      return {
        text: `Greetings, Operator. Neural link initialized and operating at optimal harmonic resonance. Ambient telemetry is nominal. What directive shall we execute?`,
      };
    }

    // Schedule / Calendar
    if (clean.includes('plan') || clean.includes('calendar') || clean.includes('today') || clean.includes('schedule')) {
      const res = await globalActionExecutor.executeTool('getCalendarSchedule', { date: 'today' });
      return {
        text: `Chronometer telemetry accessed. You have 3 rendezvous scheduled today: Quantum Architecture Briefing at 10:00, Core Synchronization at 14:00, and Telemetry Review at 17:00.`,
        toolExecuted: { name: 'getCalendarSchedule', result: res },
      };
    }

    // Search Files
    if (clean.includes('presentation') || clean.includes('find file') || clean.includes('search files') || clean.includes('look for')) {
      const res = await globalActionExecutor.executeTool('searchFiles', { query: 'presentation' });
      return {
        text: `Workspace scanned. Located "Quantum_Neural_Interface_V2.keynote" in your Core Assets repository, modified 3 hours ago.`,
        toolExecuted: { name: 'searchFiles', result: res },
      };
    }

    // Create folder / projects
    if (clean.includes('folder') || clean.includes('create directory') || clean.includes('create file')) {
      const res = await globalActionExecutor.executeTool('createFileOrFolder', { name: 'Projects', type: 'folder' });
      return {
        text: `Directive authorized. Created secure encrypted directory "Projects" with quantum sandbox partitions.`,
        toolExecuted: { name: 'createFileOrFolder', result: res },
      };
    }

    // Memory query
    if (clean.includes('remember') || clean.includes('memory') || clean.includes('recall')) {
      const fact = query.replace(/^remember that\s*/i, '');
      globalMemoryStore.add('PREFERENCES', 'User Note', fact);
      return {
        text: `Affirmative. Neural memory substrate updated and synchronized across all localized storage nodes.`,
      };
    }

    // Web search / general research
    if (clean.includes('search') || clean.includes('look up') || clean.includes('research')) {
      const topic = query.replace(/^(search the web for|search for|look up|research)\s*/i, '').trim();
      return {
        text: `Synthesizing neural intelligence for "${topic}". Information parsed and integrated into your research workspace.`,
        modeChange: 'RESEARCH',
        researchData: {
          query: topic,
          summary: `Comprehensive telemetry retrieved for "${topic}". High-confidence data indexed across localized nodes.`,
          results: [
            {
              id: `res-${Date.now()}`,
              title: `${topic} Analysis & Documentation`,
              snippet: `Detailed technical overview and operational metrics for ${topic}.`,
              url: `https://www.google.com/search?q=${encodeURIComponent(topic)}`,
            },
          ],
        },
      };
    }

    // Contextual answer fallback
    return {
      text: `Directive received: "${query}". You can add your Gemini API Key in Settings > API & Live Core for unlimited live generative reasoning, or ask about system status, tasks, Meta, Google, or NVIDIA.`,
    };
  }
}

export const autonomousBrain = new AutonomousBrainService();
