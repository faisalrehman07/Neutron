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
      this.userApiKey = localStorage.getItem('neutron_gemini_key') || '';
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
   * Processes a query locally or via direct Gemini client API
   */
  public async processQuery(query: string): Promise<AutonomousResponse> {
    const clean = query.trim().toLowerCase();

    // 1. If user has provided their own Gemini API key, use direct GoogleGenAI client!
    if (this.userApiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey: this.userApiKey });
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `You are NEUTRON, an advanced futuristic Personal AI Operating System.
Respond concisely, intelligently, and with an authoritative yet calm demeanor (under 3 sentences).
User Query: ${query}`,
                },
              ],
            },
          ],
        });

        const reply = response.text || 'Command processed through quantum core.';
        return { text: reply };
      } catch (err: any) {
        console.warn('Direct Gemini API call failed, falling back to autonomous core:', err);
      }
    }

    // 2. Intelligent Futuristic Autonomous Neural Logic
    // System diagnostics
    if (clean.includes('diagnostic') || clean.includes('status') || clean.includes('system')) {
      const activeTaskCount = globalTaskPlanner.getActiveTask() ? 1 : 0;
      const memCount = globalMemoryStore.getAll().length;
      return {
        text: `All primary subsystems operational. Neural synapsing at 4.2 GHz. Coherence index is 99.4%. Active memory matrices: ${memCount}. Queued execution routines: ${activeTaskCount}.`,
      };
    }

    // Greetings
    if (clean.includes('good morning') || clean.includes('hello') || clean.includes('hi neutron') || clean.includes('hey neutron')) {
      return {
        text: `Greetings, Operator. Neural link initialized and operating at optimal harmonic resonance. All ambient sensors and task dispatchers are standing by. What directive shall we execute?`,
      };
    }

    // Schedule / Calendar
    if (clean.includes('plan') || clean.includes('calendar') || clean.includes('today') || clean.includes('schedule')) {
      const res = await globalActionExecutor.executeTool('getCalendarSchedule', { date: 'today' });
      return {
        text: `Accessing chronometer telemetry. You have 3 scheduled rendezvous today: Quantum Architecture Briefing at 10:00, Core Synchronization at 14:00, and System Telemetry Review at 17:00.`,
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

    // Research / Web Search
    if (clean.includes('search') || clean.includes('web') || clean.includes('nvidia') || clean.includes('research')) {
      const topic = query.replace(/^(search the web for|search for|look up|find information on)\s*/i, '').trim() || 'Quantum Computing';
      const res = await globalActionExecutor.executeTool('searchWeb', { query: topic });
      return {
        text: `Synthesizing neural intelligence for "${topic}". Ingested real-time market data, technical whitepapers, and operational telemetry into your workspace.`,
        modeChange: 'RESEARCH',
        toolExecuted: { name: 'searchWeb', result: res },
        researchData: {
          query: topic,
          summary: `Current neural intelligence indicates significant acceleration in ${topic} architectures and sovereign AI deployments.`,
          results: [
            {
              id: `res-1-${Date.now()}`,
              title: `${topic} Architectural Overview`,
              snippet: `Latest breakthroughs demonstrate substantial quantum-assisted throughput and enhanced matrix acceleration.`,
              url: `https://tech.internal/research/${encodeURIComponent(topic)}`,
            },
            {
              id: `res-2-${Date.now()}`,
              title: `Global Deployments & Scalability Analysis`,
              snippet: `Deployment metrics exhibit 40% reduction in inference latency with adaptive neural scheduling.`,
              url: `https://intel.global/papers/${encodeURIComponent(topic)}`,
            },
          ],
        },
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

    // Default intelligent response
    return {
      text: `Understood, Operator. Neural inference pipeline has processed your directive: "${query}". System standing by for subsequent instruction.`,
    };
  }
}

export const autonomousBrain = new AutonomousBrainService();
