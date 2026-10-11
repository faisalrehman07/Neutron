import React from 'react';
import { AssistantState } from '../../types/ai';
import { VisualSettings, AudioMetrics } from '../../types/audio';
import { NeuralCanvas } from './NeuralCanvas';
import { Maximize2, Radio, Sparkles } from 'lucide-react';

interface MiniNeutronProps {
  state: AssistantState;
  settings: VisualSettings;
  metrics: AudioMetrics;
  onExpand: () => void;
  actionStatus?: string;
}

export const MiniNeutron: React.FC<MiniNeutronProps> = ({
  state,
  settings,
  metrics,
  onExpand,
  actionStatus,
}) => {
  const amp = Math.min(1, metrics.amplitude * 2.2);

  const getStateLabel = () => {
    if (actionStatus) return actionStatus;
    switch (state) {
      case 'SEARCHING':
        return 'SEARCHING...';
      case 'THINKING':
      case 'PROCESSING':
        return 'ANALYZING...';
      case 'SPEAKING':
        return 'SPEAKING';
      case 'LISTENING':
        return 'LISTENING';
      case 'EXECUTING':
        return 'EXECUTING...';
      default:
        return 'ONLINE';
    }
  };

  return (
    <div
      onClick={onExpand}
      title="Click to expand to full immersion"
      className="group fixed top-16 right-4 sm:top-18 sm:right-8 z-30 flex flex-col items-center cursor-pointer transition-all duration-300 hover:scale-105 active:scale-95 select-none"
    >
      {/* Outer Spectral Glow Ring responding to audio */}
      <div
        className="relative w-32 h-32 sm:w-36 sm:h-36 rounded-3xl p-1 bg-black/80 backdrop-blur-2xl border border-white/15 shadow-[0_8px_32px_rgba(0,0,0,0.8)] overflow-hidden transition-all group-hover:border-white/30"
        style={{
          boxShadow: `0 0 ${20 + amp * 30}px rgba(34, 197, 94, ${0.15 + amp * 0.3})`,
        }}
      >
        {/* Subtle Rainbow Rim Reflection */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-rose-500/10 via-emerald-500/15 to-indigo-500/10 opacity-70 pointer-events-none" />

        {/* Mini 3D Rainbow Stippled Sphere */}
        <div className="w-full h-full rounded-2xl overflow-hidden relative">
          <NeuralCanvas
            state={state}
            settings={settings}
            mode="mini"
            className="w-full h-full pointer-events-none"
          />
        </div>

        {/* Hover Expand Overlay */}
        <div className="absolute inset-0 rounded-3xl bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
          <div className="p-2 rounded-full bg-white/10 backdrop-blur-md text-white border border-white/20">
            <Maximize2 className="w-4 h-4" />
          </div>
        </div>
      </div>

      {/* Floating State Badge Underneath */}
      <div className="mt-2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/80 border border-white/10 backdrop-blur-md text-[10px] font-mono tracking-wider text-neutral-300 shadow-lg">
        {state === 'SEARCHING' || state === 'PROCESSING' ? (
          <Sparkles className="w-3 h-3 text-emerald-400 animate-spin" />
        ) : state === 'LISTENING' ? (
          <Radio className="w-3 h-3 text-cyan-400 animate-pulse" />
        ) : (
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        )}
        <span className="truncate max-w-[120px]">{getStateLabel()}</span>
      </div>
    </div>
  );
};
