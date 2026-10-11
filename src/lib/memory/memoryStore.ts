import { MemoryItem, MemoryCategory } from '../../types/memory';

const MEMORY_STORAGE_KEY = 'neutron_memories';

const INITIAL_MEMORIES: MemoryItem[] = [
  {
    id: 'mem-1',
    category: 'PROJECT_CONTEXT',
    key: 'Current Architecture',
    value: 'Building NEUTRON personal AI operating system with Gemini Live real-time audio and WebGL neural core.',
    confidence: 1.0,
    createdAt: Date.now() - 86400000,
    updatedAt: Date.now() - 86400000,
    pinned: true,
  },
  {
    id: 'mem-2',
    category: 'PREFERENCES',
    key: 'Communication Style',
    value: 'Prefers calm, intelligent, concise voice responses without repetitive AI boilerplate.',
    confidence: 0.95,
    createdAt: Date.now() - 43200000,
    updatedAt: Date.now() - 43200000,
    pinned: true,
  },
  {
    id: 'mem-3',
    category: 'TASK_MEMORY',
    key: 'Recent Presentation',
    value: 'Project Atlas presentation deck in workspace files updated yesterday at 4:30 PM.',
    confidence: 0.9,
    createdAt: Date.now() - 12000000,
    updatedAt: Date.now() - 12000000,
  },
  {
    id: 'mem-4',
    category: 'LONG_TERM',
    key: 'Primary Focus',
    value: 'Voice-first AI systems, high performance computing, and generative interfaces.',
    confidence: 0.85,
    createdAt: Date.now() - 36000000,
    updatedAt: Date.now() - 36000000,
  },
];

export class MemoryStore {
  private memories: MemoryItem[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    const raw = localStorage.getItem(MEMORY_STORAGE_KEY);
    if (raw) {
      try {
        this.memories = JSON.parse(raw);
      } catch {
        this.memories = [...INITIAL_MEMORIES];
      }
    } else {
      this.memories = [...INITIAL_MEMORIES];
      this.save();
    }
  }

  private save() {
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(this.memories));
    this.notify();
  }

  public getAll(): MemoryItem[] {
    return [...this.memories];
  }

  public add(category: MemoryCategory, key: string, value: string): MemoryItem {
    const item: MemoryItem = {
      id: `mem-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      category,
      key,
      value,
      confidence: 0.95,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    this.memories.unshift(item);
    this.save();
    return item;
  }

  public update(id: string, updates: Partial<MemoryItem>): void {
    const idx = this.memories.findIndex((m) => m.id === id);
    if (idx !== -1) {
      this.memories[idx] = { ...this.memories[idx], ...updates, updatedAt: Date.now() };
      this.save();
    }
  }

  public remove(id: string): void {
    this.memories = this.memories.filter((m) => m.id !== id);
    this.save();
  }

  public clear(): void {
    this.memories = [];
    this.save();
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }

  public getContextSummary(): string {
    return this.memories
      .map((m) => `[${m.category}] ${m.key}: ${m.value}`)
      .join('\n');
  }
}

export const globalMemoryStore = new MemoryStore();
