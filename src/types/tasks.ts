export type TaskStatus = 'IDLE' | 'ACTIVE' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'FAILED';
export type StepStatus = 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED' | 'SKIPPED' | 'WAITING_CONFIRMATION';

export interface TaskStep {
  id: string;
  description: string;
  status: StepStatus;
  tool?: string;
  result?: string;
  requiresConfirmation?: boolean;
}

export interface TaskPlan {
  id: string;
  title: string;
  goal: string;
  status: TaskStatus;
  steps: TaskStep[];
  currentStepIndex: number;
  createdAt: number;
  updatedAt: number;
}
