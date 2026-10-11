export type InterfaceMode = 'IMMERSIVE' | 'RESEARCH';

export type ResearchStatus = 'IDLE' | 'SEARCHING' | 'ANALYZING' | 'READY';

export interface ResearchResult {
  id: string;
  title: string;
  snippet: string;
  url: string;
  domain?: string;
  source?: string;
  relevance?: number;
}

export interface ResearchSession {
  id: string;
  query: string;
  summary: string;
  keyFindings: string[];
  results: ResearchResult[];
  selectedResultId?: string;
  timestamp: number;
  status: ResearchStatus;
  followUpQuestions?: string[];
}

export interface TranscriptSegment {
  id: string;
  text: string;
  type: 'sentence' | 'list' | 'heading' | 'status' | 'bullet';
  timestamp: number;
  isComplete: boolean;
}
