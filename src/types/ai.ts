export type AssistantState =
  | 'IDLE'
  | 'LISTENING'
  | 'PROCESSING'
  | 'THINKING'
  | 'SEARCHING'
  | 'PLANNING'
  | 'EXECUTING'
  | 'WAITING_FOR_PERMISSION'
  | 'WAITING_FOR_CONFIRMATION'
  | 'SPEAKING'
  | 'SUCCESS'
  | 'ERROR'
  | 'DISCONNECTED';

export type ConnectionStatus = 'ONLINE' | 'CONNECTING' | 'RECONNECTING' | 'OFFLINE';

export interface LiveMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  isPartial?: boolean;
  toolCalls?: ToolCallRecord[];
}

export interface ToolCallRecord {
  id: string;
  name: string;
  args: Record<string, any>;
  result?: any;
  riskLevel: 'SAFE' | 'SENSITIVE' | 'DESTRUCTIVE';
  status: 'PENDING' | 'CONFIRMING' | 'APPROVED' | 'REJECTED' | 'EXECUTED' | 'FAILED';
  executionMode: 'REAL' | 'SIMULATED' | 'UNAVAILABLE';
  timestamp: number;
  durationMs?: number;
}

export interface PersonalityConfig {
  name: string;
  voice: 'Fenrir' | 'Zephyr' | 'Puck' | 'Charon' | 'Kore';
  tone: 'calm' | 'intelligent' | 'concise' | 'warm';
  verbosity: 'adaptive' | 'concise' | 'detailed';
  proactivity: 'off' | 'low' | 'balanced' | 'high';
  speechRate: number;
}
