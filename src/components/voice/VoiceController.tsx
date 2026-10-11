import React from 'react';
import { AssistantState } from '../../types/ai';
import { Mic, MicOff, Square, Radio } from 'lucide-react';
import { AudioMetrics } from '../../types/audio';

interface VoiceControllerProps {
  state: AssistantState;
  isListening: boolean;
  metrics: AudioMetrics;
  onToggleVoice: () => void;
  onInterrupt: () => void;
}

export const VoiceController: React.FC<VoiceControllerProps> = ({
  state,
  isListening,
  metrics,
  onToggleVoice,
  onInterrupt,
}) => {
  const isSpeaking = state === 'SPEAKING';
  const amp = Math.min(1, metrics.amplitude * 2.5);

  const getStatusText = () => {
    switch (state) {
      case 'LISTENING':
        return metrics.isInputSpeaking ? 'Detecting your voice...' : 'Listening...';
      case 'SPEAKING':
        return 'NEUTRON speaking (click to barge in)';
      case 'THINKING':
      case 'PROCESSING':
        return 'Synthesizing reasoning...';
      case 'SEARCHING':
        return 'Retrieving live intelligence...';
      case 'EXECUTING':
        return 'Executing authorized tool...';
      case 'WAITING_FOR_CONFIRMATION':
        return 'Awaiting your confirmation';
      default:
        return 'Hold or click to speak';
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Central Interactive Voice Button */}
      <div className="relative flex items-center justify-center">
        {/* Living Audio Reactive Spectral Ripple Ring */}
        {isListening && (
          <div
            className="absolute rounded-full pointer-events-none transition-transform duration-75"
            style={{
              width: `${76 + amp * 56}px`,
              height: `${76 + amp * 56}px`,
              background: 'radial-gradient(circle, rgba(34,197,94,0.18) 0%, rgba(6,182,212,0.12) 60%, rgba(244,63,94,0.08) 100%)',
              border: '1px solid rgba(255,255,255,0.2)',
              opacity: 0.4 + amp * 0.6,
            }}
          />
        )}

        {/* Core Mic Button */}
        {isSpeaking ? (
          <button
            onClick={onInterrupt}
            className="group relative z-10 flex items-center justify-center w-16 h-16 rounded-full bg-black/90 border border-white/40 text-white shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 active:scale-95 transition-all cursor-pointer"
            title="Interrupt NEUTRON"
          >
            <Square className="w-5 h-5 fill-white group-hover:scale-110 transition-transform" />
            <span className="sr-only">Interrupt NEUTRON</span>
          </button>
        ) : (
          <button
            onClick={onToggleVoice}
            className={`group relative z-10 flex items-center justify-center w-16 h-16 rounded-full transition-all duration-300 hover:scale-105 active:scale-95 cursor-pointer ${
              isListening
                ? 'bg-white text-black shadow-[0_0_40px_rgba(255,255,255,0.7)] border border-white'
                : 'bg-black/80 border border-white/20 hover:border-white/50 text-neutral-300 hover:text-white shadow-[0_4px_24px_rgba(0,0,0,0.8)]'
            }`}
            title={isListening ? 'Stop Listening' : 'Start Voice Conversation'}
          >
            {isListening ? (
              <Mic className="w-6 h-6 animate-pulse" />
            ) : (
              <MicOff className="w-6 h-6 group-hover:text-white transition-colors" />
            )}
          </button>
        )}
      </div>

      {/* Voice Status Indicator Pill */}
      <div className="flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-neutral-300 tracking-wide backdrop-blur-md">
        {isListening && (
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
        )}
        <span>{getStatusText()}</span>
      </div>
    </div>
  );
};
