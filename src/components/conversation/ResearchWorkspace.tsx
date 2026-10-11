import React from 'react';
import { ResearchSession } from '../../types/research';
import { TranscriptSegment } from '../../types/research';
import { ResearchResultCard } from './ResearchResultCard';
import { Sparkles, Globe, Minimize2, ArrowRight, Bot, Compass, CheckCircle2 } from 'lucide-react';

interface ResearchWorkspaceProps {
  session: ResearchSession;
  segments: TranscriptSegment[];
  activePartialText: string;
  onExitResearch: () => void;
  onSendFollowUp: (text: string) => void;
  isModelSpeaking: boolean;
}

export const ResearchWorkspace: React.FC<ResearchWorkspaceProps> = ({
  session,
  segments,
  activePartialText,
  onExitResearch,
  onSendFollowUp,
  isModelSpeaking,
}) => {
  const defaultFollowUps = [
    'Which option is recommended?',
    'What are the key differences?',
    'Summarize the pros and cons',
    'Find more details on the top source',
  ];

  const followUps = session.followUpQuestions && session.followUpQuestions.length > 0
    ? session.followUpQuestions
    : defaultFollowUps;

  return (
    <div className="relative z-10 w-full max-w-4xl mx-auto px-4 sm:px-6 py-4 flex flex-col space-y-6 pointer-events-auto max-h-[calc(100vh-140px)] overflow-y-auto no-scrollbar font-sans animate-fade-in">
      {/* 1. Research Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 sm:p-5 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-2xl shadow-2xl">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase font-semibold flex items-center gap-1.5">
              <Compass className="w-3.5 h-3.5 animate-spin" />
              RESEARCH WORKSPACE
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/[0.06] border border-white/10 text-neutral-300">
              {session.results.length} Sources Found
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white capitalize">
            {session.query}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onExitResearch}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.1] border border-white/10 text-xs font-mono text-neutral-300 hover:text-white transition-all cursor-pointer"
          >
            <Minimize2 className="w-3.5 h-3.5" />
            <span>Return to Immersion</span>
          </button>
        </div>
      </div>

      {/* 2. Live AI Speech & Semantic Summary Block */}
      <div className="p-5 sm:p-6 rounded-3xl bg-black/60 border border-white/10 backdrop-blur-2xl shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/[0.06] pb-3">
          <div className="flex items-center gap-2 text-xs font-mono font-semibold text-emerald-400">
            <Bot className="w-4 h-4 text-emerald-400" />
            <span>AI SYNTHESIS</span>
          </div>
          {isModelSpeaking && (
            <span className="flex items-center gap-1.5 text-[11px] font-mono text-cyan-300">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
              Live Speaking
            </span>
          )}
        </div>

        {/* Ordered Stream of Processed Sentences */}
        <div className="space-y-2.5 text-sm text-neutral-200 leading-relaxed font-sans">
          {segments.length > 0 ? (
            segments.map((seg) => (
              <div
                key={seg.id}
                className={`transition-all ${
                  seg.type === 'list'
                    ? 'p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.05] text-neutral-100 font-medium'
                    : seg.type === 'heading'
                    ? 'text-xs font-mono uppercase tracking-wider text-emerald-300 pt-2 font-semibold'
                    : 'text-neutral-200'
                }`}
              >
                {seg.text}
              </div>
            ))
          ) : (
            <div className="text-neutral-400 italic">
              {session.summary || 'Retrieving web intelligence and formulating synthesis...'}
            </div>
          )}

          {/* Active Streaming Partial Chunk */}
          {activePartialText && (
            <span className="text-white font-medium inline-flex items-baseline gap-1">
              <span>{activePartialText}</span>
              <span className="inline-block w-1.5 h-3.5 bg-emerald-400 animate-pulse ml-0.5" />
            </span>
          )}
        </div>
      </div>

      {/* 3. Verified Web Sources */}
      {session.results.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-neutral-400 px-1">
            <span className="flex items-center gap-1.5 uppercase tracking-wider font-semibold">
              <Globe className="w-3.5 h-3.5 text-cyan-400" />
              Verified External Sources
            </span>
            <span>{session.results.length} links</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {session.results.map((res, idx) => (
              <ResearchResultCard
                key={res.id || `res-${idx}`}
                result={res}
                index={idx}
                onAskAbout={(title) =>
                  onSendFollowUp(`Tell me more about what ${title} reports.`)
                }
              />
            ))}
          </div>
        </div>
      )}

      {/* 4. Context-Aware Follow-Up Suggestions */}
      <div className="p-4 rounded-3xl bg-black/50 border border-white/10 backdrop-blur-xl space-y-2.5">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-neutral-400 uppercase tracking-wider font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Follow-Up Voice Questions</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {followUps.map((question) => (
            <button
              key={question}
              onClick={() => onSendFollowUp(question)}
              className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/40 text-xs font-sans text-neutral-300 hover:text-white transition-all cursor-pointer"
            >
              <span>{question}</span>
              <ArrowRight className="w-3 h-3 text-neutral-500 group-hover:text-emerald-400 transition-colors" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
