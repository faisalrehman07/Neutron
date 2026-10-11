import React from 'react';
import { AssistantState, ConnectionStatus } from '../../types/ai';
import { Activity, Brain, CheckSquare, Wrench, Settings, Mic, Volume2 } from 'lucide-react';

interface HeaderProps {
  state: AssistantState;
  connectionStatus: ConnectionStatus;
  onOpenActivity: () => void;
  onOpenMemory: () => void;
  onOpenTasks: () => void;
  onOpenTools: () => void;
  onOpenSettings: () => void;
  activeTaskCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  state,
  connectionStatus,
  onOpenActivity,
  onOpenMemory,
  onOpenTasks,
  onOpenTools,
  onOpenSettings,
  activeTaskCount,
}) => {
  const getStatusColor = () => {
    switch (connectionStatus) {
      case 'ONLINE':
        return 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]';
      case 'CONNECTING':
      case 'RECONNECTING':
        return 'bg-amber-400 animate-pulse shadow-[0_0_10px_rgba(251,191,36,0.8)]';
      case 'OFFLINE':
        return 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]';
    }
  };

  const getStateBadge = () => {
    switch (state) {
      case 'LISTENING':
        return { text: 'LISTENING', color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' };
      case 'SPEAKING':
        return { text: 'SPEAKING', color: 'text-cyan-300 border-cyan-400/40 bg-cyan-500/10' };
      case 'THINKING':
      case 'PROCESSING':
        return { text: 'REASONING', color: 'text-indigo-400 border-indigo-500/40 bg-indigo-500/10' };
      case 'SEARCHING':
        return { text: 'SEARCHING', color: 'text-teal-400 border-teal-500/40 bg-teal-500/10' };
      case 'PLANNING':
        return { text: 'PLANNING', color: 'text-blue-400 border-blue-500/40 bg-blue-500/10' };
      case 'EXECUTING':
        return { text: 'EXECUTING', color: 'text-cyan-400 border-cyan-500/40 bg-cyan-500/10' };
      case 'WAITING_FOR_CONFIRMATION':
      case 'WAITING_FOR_PERMISSION':
        return { text: 'WAITING', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' };
      case 'ERROR':
        return { text: 'ATTENTION', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' };
      default:
        return { text: 'READY', color: 'text-slate-400 border-slate-700/60 bg-slate-800/40' };
    }
  };

  const stateInfo = getStateBadge();

  return (
    <header className="relative z-20 flex items-center justify-between px-4 sm:px-8 py-3.5 backdrop-blur-xl bg-black/40 border-b border-white/[0.06]">
      {/* Brand & Mark */}
      <div className="flex items-center gap-3">
        {/* Custom NEUTRON Spectral Mark */}
        <div className="relative w-8 h-8 rounded-full bg-black border border-white/20 flex items-center justify-center shadow-[0_0_20px_rgba(34,197,94,0.25)] overflow-hidden">
          {/* Subtle rainbow gradient rim */}
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-rose-500 via-emerald-400 to-indigo-500 opacity-60 blur-[2px]" />
          <div className="absolute inset-[1.5px] rounded-full bg-black flex items-center justify-center">
            <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <circle cx="12" cy="12" r="3.5" className="fill-white/20" />
              <path d="M12 2v3m0 14v3M2 12h3m14 0h3" />
            </svg>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2.5">
            <span className="font-mono text-base font-bold tracking-[0.2em] text-white">NEUTRON</span>
            <span className={`text-[10px] font-mono font-medium px-2 py-0.5 rounded-full border backdrop-blur-md ${stateInfo.color}`}>
              {stateInfo.text}
            </span>
          </div>
          <p className="text-[10px] tracking-widest text-neutral-400 uppercase hidden sm:block font-mono">
            Personal AI Operating System
          </p>
        </div>
      </div>

      {/* Navigation & Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Connection status badge */}
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.04] border border-white/10 text-[11px] font-mono text-neutral-300 backdrop-blur-md">
          <span className={`w-2 h-2 rounded-full ${getStatusColor()}`} />
          <span className="hidden xs:inline">{connectionStatus}</span>
        </div>

        {/* Action Buttons */}
        <button
          onClick={onOpenTasks}
          title="Active Tasks & Workflow"
          className="relative p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer"
        >
          <CheckSquare className="w-4 h-4" />
          {activeTaskCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 text-[10px] font-bold text-black flex items-center justify-center">
              {activeTaskCount}
            </span>
          )}
        </button>

        <button
          onClick={onOpenMemory}
          title="Context & Memory"
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer"
        >
          <Brain className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenTools}
          title="Registered Tools"
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer"
        >
          <Wrench className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenActivity}
          title="Activity Console & Audit Log"
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer"
        >
          <Activity className="w-4 h-4" />
        </button>

        <button
          onClick={onOpenSettings}
          title="System Settings"
          className="p-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.09] border border-white/10 hover:border-emerald-500/40 text-neutral-300 hover:text-white transition-all cursor-pointer"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};
