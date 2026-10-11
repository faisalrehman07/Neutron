export type MemoryCategory =
  | 'SHORT_TERM'
  | 'LONG_TERM'
  | 'TASK_MEMORY'
  | 'PREFERENCES'
  | 'PROJECT_CONTEXT'
  | 'CONVERSATION_SUMMARY';

export interface MemoryItem {
  id: string;
  category: MemoryCategory;
  key: string;
  value: string;
  confidence: number;
  createdAt: number;
  updatedAt: number;
  source?: string;
  pinned?: boolean;
}
