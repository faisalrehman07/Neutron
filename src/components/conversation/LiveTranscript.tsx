import React, { useState } from 'react';
import { LiveMessage } from '../../types/ai';
import { TranscriptSegment } from '../../types/research';
import { ChevronDown, ChevronUp, Bot, User, Sparkles, Terminal } from 'lucide-react';

interface LiveTranscriptProps {
  currentInputText: string;
  currentOutputText: string;
  history: LiveMessage[];
  activeActionStatus?: string;
  isExecutingTool?: boolean;
  segments?: TranscriptSegment[];
  activePartialText?: string;
}

export const LiveTranscript: React.FC<LiveTranscriptProps> = ({
  currentInputText,
  currentOutputText,
  history,
  activeActionStatus,
  segments = [],
  activePartialText = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasActiveContent =
    !!currentInputText ||
    !!currentOutputText ||
    !!activeActionStatus ||
    segments.length > 0 ||
    !!activePartialText;
  const recentHistory = history.slice(-4);

  if (!hasActiveContent && recentHistory.length === 0) {
    return null;
  }

  return (
    <div className="relative z-10 w-full max-w-xl mx-auto px-4 pointer-events-auto">
      <div className="rounded-2xl backdrop-blur-2xl bg-black/60 border border-white/10 shadow-[0_8px_40px_rgba(0,0,0,0.9)] overflow-hidden transition-all duration-300">
        {/* Active Action Tool Status Banner */}
        {activeActionStatus && (
          <div className="flex items-center gap-2.5 px-4 py-2 bg-white/[0.04] border-b border-white/10 text-xs font-mono text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span>{activeActionStatus}</span>
          </div>
        )}

        {/* Live Conversation Stream */}
        <div className="p-4 space-y-3 max-h-60 overflow-y-auto font-sans">
          {/* Expanded history */}
          {isExpanded &&
            recentHistory.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 text-sm ${
                  msg.role === 'assistant' ? 'text-neutral-200' : 'text-neutral-300'
                }`}
              >
                <div className="mt-0.5 shrink-0">
                  {msg.role === 'assistant' ? (
                    <Bot className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <User className="w-4 h-4 text-neutral-400" />
                  )}
                </div>
                <div className="leading-relaxed">
                  <p>{msg.content}</p>
                  {msg.toolCalls && msg.toolCalls.length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {msg.toolCalls.map((tc) => (
                        <span
                          key={tc.id}
                          className="inline-flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-white/[0.05] border border-white/10 text-neutral-300"
                        >
                          <Terminal className="w-3 h-3 text-emerald-400" />
                          {tc.name} {tc.executionMode === 'REAL' ? '✓' : '⟳'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

          {/* User Spoken / Typed Live Stream */}
          {currentInputText && (
            <div className="flex gap-3 text-sm text-neutral-200">
              <User className="w-4 h-4 text-neutral-400 mt-0.5 shrink-0" />
              <div className="leading-relaxed font-medium">
                <span>{currentInputText}</span>
              </div>
            </div>
          )}

          {/* NEUTRON Response Stream - Structured Segments or Fallback */}
          {(segments.length > 0 || activePartialText || currentOutputText) && (
            <div className="flex gap-3 text-sm text-white">
              <Bot className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0 animate-pulse" />
              <div className="leading-relaxed space-y-1.5 flex-1">
                {segments.length > 0 ? (
                  segments.map((seg) => (
                    <p
                      key={seg.id}
                      className={
                        seg.type === 'list'
                          ? 'pl-2 border-l border-emerald-400/50 text-neutral-100 font-medium'
                          : seg.type === 'heading'
                          ? 'text-xs font-mono uppercase tracking-wider text-emerald-300 font-semibold'
                          : 'text-neutral-100'
                      }
                    >
                      {seg.text}
                    </p>
                  ))
                ) : (
                  <p>{currentOutputText}</p>
                )}

                {/* Particle-to-text live word emergence indicator */}
                {activePartialText && (
                  <p className="text-white font-medium inline-flex items-baseline gap-1">
                    <span>{activePartialText}</span>
                    <span className="inline-block w-1.5 h-3.5 bg-emerald-400 animate-pulse ml-0.5" />
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Bar: Expand / Collapse History */}
        {recentHistory.length > 0 && (
          <div className="flex items-center justify-between px-4 py-1.5 bg-black/40 border-t border-white/10 text-[11px] font-mono text-neutral-400">
            <span>Live Transcript</span>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer"
            >
              <span>{isExpanded ? 'Less' : 'Previous turns'}</span>
              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
