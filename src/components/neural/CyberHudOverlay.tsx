import React from 'react';
import { AssistantState, ConnectionStatus } from '../../types/ai';
import { AudioMetrics } from '../../types/audio';
import { InterfaceMode } from '../../types/research';
import { 
  Activity, 
  Cpu, 
  ShieldCheck, 
  Wifi, 
  Volume2, 
  VolumeX, 
  Radio, 
  Compass, 
  Zap,
  Layers,
  Sparkles
} from 'lucide-react';
import { soundEffects } from '../../lib/audio/SoundEffects';

interface CyberHudOverlayProps {
  state: AssistantState;
  connectionStatus: ConnectionStatus;
  metrics: AudioMetrics;
  fps: number;
  latency: number;
  interfaceMode: InterfaceMode;
  onSetInterfaceMode: (mode: InterfaceMode) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onQuickCommand: (cmd: string) => void;
}

export const CyberHudOverlay: React.FC<CyberHudOverlayProps> = ({
  state,
  connectionStatus,
  metrics,
  fps,
  latency,
  interfaceMode,
  onSetInterfaceMode,
  isMuted,
  onToggleMute,
  onQuickCommand,
}) => {
  const amp = Math.min(1, metrics.amplitude * 2.2);
  const coherence = Math.min(100, Math.floor(98.4 + Math.sin(Date.now() / 1500) * 1.5));
  const synapseFreq = (4.18 + Math.sin(Date.now() / 3000) * 0.12).toFixed(2);

  // 16 Frequency bars for audio spectrum visualizer
  const bars = Array.from({ length: 16 }, (_, i) => {
    const factor = Math.sin((i / 16) * Math.PI);
    const height = Math.max(12, Math.min(100, (amp * 80 + Math.sin(Date.now() / 200 + i) * 15 + 15) * factor));
    return height;
  });

  return (
    <div className="absolute inset-0 pointer-events-none z-10 select-none overflow-hidden font-mono">
      {/* 1. Subtle High-Tech Hexagonal Grid / Scanlines Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.03] bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"
      />

      {/* 2. Central Holographic Reticle / Orbit Rings around the Neural Core */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] sm:w-[480px] sm:h-[480px] pointer-events-none flex items-center justify-center">
        {/* Outer Tech Ring with Notch Dashes */}
        <div 
          className="absolute inset-0 rounded-full border border-sky-500/15 border-dashed animate-[spin_60s_linear_infinite]"
          style={{ opacity: 0.4 + amp * 0.4 }}
        />
        {/* Counter-rotating Segmented Ring */}
        <div 
          className="absolute inset-4 rounded-full border-t border-b border-emerald-400/20 border-l-transparent border-r-transparent animate-[spin_40s_linear_infinite_reverse]" 
        />
        {/* Four Corner Cyber Brackets */}
        <div className="absolute top-0 left-0 w-6 h-6 border-t-2 border-l-2 border-sky-400/40" />
        <div className="absolute top-0 right-0 w-6 h-6 border-t-2 border-r-2 border-sky-400/40" />
        <div className="absolute bottom-0 left-0 w-6 h-6 border-b-2 border-l-2 border-emerald-400/40" />
        <div className="absolute bottom-0 right-0 w-6 h-6 border-b-2 border-r-2 border-emerald-400/40" />

        {/* Orbit Crosshairs */}
        <div className="absolute top-1/2 left-[-20px] w-4 h-[1px] bg-sky-400/40" />
        <div className="absolute top-1/2 right-[-20px] w-4 h-[1px] bg-sky-400/40" />
        <div className="absolute top-[-20px] left-1/2 w-[1px] h-4 bg-sky-400/40" />
        <div className="absolute bottom-[-20px] left-1/2 w-[1px] h-4 bg-sky-400/40" />
      </div>

      {/* 3. Top Left Cyber Diagnostic Card */}
      <div className="absolute top-16 left-4 sm:left-8 pointer-events-auto hidden md:flex flex-col gap-2 p-3.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] w-60">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 text-[10px] uppercase tracking-wider text-neutral-400">
          <span className="flex items-center gap-1.5 text-sky-400">
            <Cpu className="w-3.5 h-3.5" />
            <span>NEURAL CORE V4</span>
          </span>
          <span className="text-emerald-400 font-semibold">{coherence}% SYNC</span>
        </div>

        <div className="grid grid-cols-2 gap-2 text-[10px]">
          <div className="bg-white/[0.03] p-1.5 rounded-lg border border-white/[0.04]">
            <span className="text-neutral-500 block text-[9px]">CLOCK FREQ</span>
            <span className="text-neutral-200 font-semibold">{synapseFreq} GHz</span>
          </div>
          <div className="bg-white/[0.03] p-1.5 rounded-lg border border-white/[0.04]">
            <span className="text-neutral-500 block text-[9px]">ACTIVITY STATE</span>
            <span className="text-cyan-300 font-semibold truncate block">{state}</span>
          </div>
        </div>

        {/* Dynamic Synaptic Load Progress Bar */}
        <div className="space-y-1">
          <div className="flex justify-between text-[9px] text-neutral-400">
            <span>SYNAPTIC FLUX</span>
            <span>{Math.round(amp * 100)}%</span>
          </div>
          <div className="w-full h-1 bg-white/[0.08] rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-sky-400 via-emerald-400 to-indigo-400 transition-all duration-100"
              style={{ width: `${Math.max(8, amp * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* 4. Top Right Telemetry & Protocol Card */}
      <div className="absolute top-16 right-4 sm:right-8 pointer-events-auto hidden md:flex flex-col gap-2 p-3.5 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)] w-56 text-[10px]">
        <div className="flex items-center justify-between border-b border-white/[0.08] pb-1.5 uppercase tracking-wider text-neutral-400">
          <span className="flex items-center gap-1.5 text-emerald-400">
            <Activity className="w-3.5 h-3.5" />
            <span>TELEMETRY HUD</span>
          </span>
          <span className="text-neutral-300">{fps} FPS</span>
        </div>

        <div className="space-y-1 text-neutral-300">
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">LATENCY</span>
            <span className="text-emerald-300">{latency} ms</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">GATEWAY</span>
            <span className="text-sky-300">{connectionStatus === 'ONLINE' ? 'WSS LIVE BRIDGE' : 'STANDALONE NEURAL OS'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-neutral-500">SECURITY</span>
            <span className="flex items-center gap-1 text-emerald-400">
              <ShieldCheck className="w-3 h-3" />
              <span>ENCRYPTED</span>
            </span>
          </div>
        </div>
      </div>

      {/* 5. Bottom Left: Live Audio Spectrum Equalizer */}
      <div className="absolute bottom-24 left-4 sm:left-8 pointer-events-auto hidden lg:flex flex-col gap-2 p-3 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/[0.08] shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
        <div className="flex items-center justify-between text-[10px] text-neutral-400 uppercase tracking-wider">
          <span className="flex items-center gap-1 text-cyan-400">
            <Radio className="w-3 h-3" />
            <span>SPECTRAL HARMONICS</span>
          </span>
          <span>24kHz</span>
        </div>
        <div className="flex items-end gap-1 h-10 w-44 px-1 py-1 bg-white/[0.02] rounded-lg border border-white/[0.04]">
          {bars.map((h, idx) => (
            <div
              key={idx}
              className="flex-1 rounded-sm bg-gradient-to-t from-sky-500 via-emerald-400 to-cyan-300 transition-all duration-75"
              style={{ height: `${h}%` }}
            />
          ))}
        </div>
      </div>

      {/* 6. Bottom Right: Audio SFX toggle & Mode Switcher */}
      <div className="absolute bottom-24 right-4 sm:right-8 pointer-events-auto flex items-center gap-2">
        {/* Audio Mute/SFX Toggle */}
        <button
          onClick={() => {
            onToggleMute();
            soundEffects.playClick();
          }}
          title={isMuted ? 'Unmute Audio Feedback' : 'Mute Audio Feedback'}
          className="p-2.5 rounded-xl bg-black/50 hover:bg-black/80 backdrop-blur-xl border border-white/10 hover:border-sky-400/40 text-neutral-400 hover:text-white transition-all cursor-pointer shadow-lg"
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
        </button>

        {/* Interface Mode Selector (IMMERSIVE vs RESEARCH) */}
        <div className="flex items-center p-1 rounded-xl bg-black/50 backdrop-blur-xl border border-white/10 text-xs">
          <button
            onClick={() => {
              onSetInterfaceMode('IMMERSIVE');
              soundEffects.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-[11px] font-semibold flex items-center gap-1.5 ${
              interfaceMode === 'IMMERSIVE'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-400/30 shadow-[0_0_12px_rgba(56,189,248,0.2)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>IMMERSIVE</span>
          </button>
          <button
            onClick={() => {
              onSetInterfaceMode('RESEARCH');
              soundEffects.playClick();
            }}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer text-[11px] font-semibold flex items-center gap-1.5 ${
              interfaceMode === 'RESEARCH'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 shadow-[0_0_12px_rgba(52,211,153,0.2)]'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>RESEARCH</span>
          </button>
        </div>
      </div>
    </div>
  );
};
