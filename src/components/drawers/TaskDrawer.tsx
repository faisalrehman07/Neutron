import React, { useState } from 'react';
import { X, CheckSquare, Play, Pause, XCircle, CheckCircle2, Clock, Plus, Sparkles } from 'lucide-react';
import { TaskPlan, TaskStep } from '../../types/tasks';
import { globalTaskPlanner } from '../../lib/tasks/taskPlanner';

interface TaskDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTask: TaskPlan | null;
  history: TaskPlan[];
}

export const TaskDrawer: React.FC<TaskDrawerProps> = ({ isOpen, onClose, activeTask, history }) => {
  const [customTitle, setCustomTitle] = useState('');
  const [customGoal, setCustomGoal] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  if (!isOpen) return null;

  const handleStartTemplate = (templateName: string) => {
    if (templateName === 'atlas') {
      globalTaskPlanner.createPlan(
        'Prepare Project Atlas Briefing',
        'Find presentation, extract metrics, summarize key talking points, and notify team.',
        [
          'Search files for "Project Atlas"',
          'Verify latest slide modification timestamp',
          'Extract executive talking points',
          'Check calendar schedule for 2:00 PM briefing',
        ]
      );
    } else if (templateName === 'daily') {
      globalTaskPlanner.createPlan(
        'Execute Daily Morning Plan',
        'Check calendar agenda, prioritize pending emails, and review system status.',
        [
          'Retrieve agenda events for today',
          'Review unread contacts notifications',
          'Run hardware concurrency & telemetry diagnostic',
          'Synthesize unified audio briefing',
        ]
      );
    } else if (templateName === 'research') {
      globalTaskPlanner.createPlan(
        'Deep Tech Research: Gemini Live Architecture',
        'Search web for Live API specifications, compare WebSockets latency, and draft report.',
        [
          'Query web search for official Gemini Live documentation',
          'Extract Web Audio PCM 16kHz/24kHz specifications',
          'Create Architecture_Notes.md file',
          'Store findings in long-term memory',
        ]
      );
    }
  };

  const handleCreateCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customTitle.trim() || !customGoal.trim()) return;
    globalTaskPlanner.createPlan(customTitle.trim(), customGoal.trim(), [
      'Initialize task context and verify permissions',
      'Execute primary action with authorized tools',
      'Synthesize results and present confirmation',
    ]);
    setCustomTitle('');
    setCustomGoal('');
    setIsCreating(false);
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-slate-950/95 backdrop-blur-2xl border-l border-cyan-500/20 shadow-2xl flex flex-col font-sans animate-slide-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <CheckSquare className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
            Task Planner & Multi-Step Workflows
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {/* ACTIVE TASK SECTION */}
        {activeTask ? (
          <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/30 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-cyan-500 text-slate-950 uppercase">
                {activeTask.status}
              </span>
              <div className="flex items-center gap-2">
                {activeTask.status === 'ACTIVE' ? (
                  <button
                    onClick={() => globalTaskPlanner.pauseTask()}
                    className="p-1 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300"
                    title="Pause Task"
                  >
                    <Pause className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={() => globalTaskPlanner.resumeTask()}
                    className="p-1 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-slate-300"
                    title="Resume Task"
                  >
                    <Play className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => globalTaskPlanner.cancelTask()}
                  className="p-1 rounded bg-slate-900 border border-slate-700 hover:bg-slate-800 text-rose-400"
                  title="Cancel Task"
                >
                  <XCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-100">{activeTask.title}</h3>
              <p className="text-xs text-slate-400 mt-1">{activeTask.goal}</p>
            </div>

            {/* Steps Checklist */}
            <div className="space-y-2.5 pt-2 border-t border-cyan-500/20">
              <div className="text-[11px] font-mono text-cyan-300 font-semibold uppercase">
                Execution Steps
              </div>
              {activeTask.steps.map((step, idx) => (
                <div
                  key={step.id}
                  className={`p-2.5 rounded-xl border text-xs space-y-1 transition-all ${
                    step.status === 'COMPLETED'
                      ? 'bg-slate-900/60 border-emerald-500/30 text-slate-300'
                      : step.status === 'RUNNING'
                      ? 'bg-cyan-950/40 border-cyan-400/50 text-cyan-200 ring-1 ring-cyan-400/30'
                      : 'bg-slate-900/40 border-slate-800/80 text-slate-500'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {step.status === 'COMPLETED' ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : step.status === 'RUNNING' ? (
                        <span className="w-3.5 h-3.5 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin shrink-0" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <span className="font-medium text-slate-200">
                        {idx + 1}. {step.description}
                      </span>
                    </div>

                    {step.status === 'RUNNING' && (
                      <button
                        onClick={() => globalTaskPlanner.advanceStep(idx, 'Executed by operator')}
                        className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500 text-slate-950 font-semibold hover:bg-cyan-400 cursor-pointer"
                      >
                        Advance Step
                      </button>
                    )}
                  </div>

                  {step.result && (
                    <div className="text-[11px] font-mono text-slate-400 pl-6">{step.result}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-6 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-3">
            <CheckSquare className="w-8 h-8 text-slate-600 mx-auto" />
            <div>
              <p className="text-sm font-medium text-slate-300">No Task Currently Active</p>
              <p className="text-xs text-slate-500 mt-1">
                Say &ldquo;Help me plan my day&rdquo; or launch a workflow template below.
              </p>
            </div>
          </div>
        )}

        {/* WORKFLOW TEMPLATES */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Workflow Templates</span>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => handleStartTemplate('atlas')}
              className="w-full p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                Prepare Project Atlas Presentation
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Finds deck, audits timestamps, compiles notes, prepares briefing.
              </p>
            </button>

            <button
              onClick={() => handleStartTemplate('daily')}
              className="w-full p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                Daily Morning Briefing
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Inspects schedule, queries telemetry, prepares concise voice summary.
              </p>
            </button>

            <button
              onClick={() => handleStartTemplate('research')}
              className="w-full p-3 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-cyan-500/40 text-left transition-all group cursor-pointer"
            >
              <div className="text-xs font-semibold text-slate-200 group-hover:text-cyan-300">
                Deep Tech Research Pipeline
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Web search, file generation, and memory retention workflow.
              </p>
            </button>
          </div>
        </div>

        {/* CUSTOM TASK BUILDER */}
        {isCreating ? (
          <form onSubmit={handleCreateCustom} className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-3">
            <div className="text-xs font-semibold text-cyan-300">Custom Multi-Step Task</div>
            <input
              type="text"
              placeholder="Task Title (e.g. Code Review)"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              className="w-full p-2 text-xs rounded bg-slate-950 border border-slate-800 text-slate-200 outline-none"
            />
            <textarea
              placeholder="Primary Goal"
              rows={2}
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              className="w-full p-2 text-xs rounded bg-slate-950 border border-slate-800 text-slate-200 outline-none"
            />
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsCreating(false)}
                className="px-3 py-1.5 text-xs rounded bg-slate-800 text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold"
              >
                Launch Plan
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsCreating(true)}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create Custom Plan</span>
          </button>
        )}
      </div>
    </div>
  );
};
