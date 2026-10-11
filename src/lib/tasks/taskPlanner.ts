import { TaskPlan, TaskStep, TaskStatus } from '../../types/tasks';

const TASK_STORAGE_KEY = 'neutron_tasks';

const INITIAL_TASK: TaskPlan = {
  id: 'task-pres-1',
  title: 'Prepare Presentation for Project Atlas',
  goal: 'Find latest presentation deck, extract key metrics, and prepare executive briefing.',
  status: 'COMPLETED',
  currentStepIndex: 4,
  createdAt: Date.now() - 3600000,
  updatedAt: Date.now() - 300000,
  steps: [
    {
      id: 'step-1',
      description: 'Search workspace files for "Project Atlas"',
      status: 'COMPLETED',
      tool: 'searchFiles',
      result: 'Found 3 files: Project_Atlas_Deck_v2.key, Architecture_Diagram.png, notes.md',
    },
    {
      id: 'step-2',
      description: 'Check latest modification timestamp and version diff',
      status: 'COMPLETED',
      tool: 'searchFiles',
      result: 'Confirmed v2 was updated yesterday at 4:30 PM with Q3 milestones.',
    },
    {
      id: 'step-3',
      description: 'Summarize key executive talking points',
      status: 'COMPLETED',
      result: '3 core pillars: Live audio streaming, Neural fluid rendering, zero-latency tool routing.',
    },
    {
      id: 'step-4',
      description: 'Verify calendar availability and notify team',
      status: 'COMPLETED',
      tool: 'getCalendarSchedule',
      result: 'Prepared briefing for today 2:00 PM.',
    },
  ],
};

export class TaskPlanner {
  private activeTask: TaskPlan | null = null;
  private history: TaskPlan[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    const raw = localStorage.getItem(TASK_STORAGE_KEY);
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        this.activeTask = parsed.activeTask || null;
        this.history = parsed.history || [INITIAL_TASK];
      } catch {
        this.history = [INITIAL_TASK];
      }
    } else {
      this.history = [INITIAL_TASK];
      this.save();
    }
  }

  private save() {
    localStorage.setItem(
      TASK_STORAGE_KEY,
      JSON.stringify({ activeTask: this.activeTask, history: this.history })
    );
    this.notify();
  }

  public getActiveTask(): TaskPlan | null {
    return this.activeTask;
  }

  public getHistory(): TaskPlan[] {
    return this.history;
  }

  public createPlan(title: string, goal: string, stepDescriptions: string[]): TaskPlan {
    const plan: TaskPlan = {
      id: `task-${Date.now()}`,
      title,
      goal,
      status: 'ACTIVE',
      currentStepIndex: 0,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      steps: stepDescriptions.map((desc, idx) => ({
        id: `step-${idx + 1}`,
        description: desc,
        status: idx === 0 ? 'RUNNING' : 'PENDING',
      })),
    };
    this.activeTask = plan;
    this.save();
    return plan;
  }

  public advanceStep(stepIndex: number, result?: string): void {
    if (!this.activeTask) return;
    const task = this.activeTask;
    if (task.steps[stepIndex]) {
      task.steps[stepIndex].status = 'COMPLETED';
      if (result) task.steps[stepIndex].result = result;
    }

    const nextIdx = stepIndex + 1;
    if (nextIdx < task.steps.length) {
      task.currentStepIndex = nextIdx;
      task.steps[nextIdx].status = 'RUNNING';
    } else {
      task.status = 'COMPLETED';
      this.history.unshift({ ...task });
      this.activeTask = null;
    }
    task.updatedAt = Date.now();
    this.save();
  }

  public pauseTask(): void {
    if (this.activeTask) {
      this.activeTask.status = 'PAUSED';
      this.save();
    }
  }

  public resumeTask(): void {
    if (this.activeTask) {
      this.activeTask.status = 'ACTIVE';
      this.save();
    }
  }

  public cancelTask(): void {
    if (this.activeTask) {
      this.activeTask.status = 'CANCELLED';
      this.history.unshift({ ...this.activeTask });
      this.activeTask = null;
      this.save();
    }
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach((cb) => cb());
  }
}

export const globalTaskPlanner = new TaskPlanner();
