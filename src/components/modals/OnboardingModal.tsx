import React, { useState } from 'react';
import { PersonalityConfig } from '../../types/ai';
import { Mic, Sparkles, Volume2, ShieldCheck, Check } from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (personality: PersonalityConfig) => void;
  onRequestMic: () => Promise<boolean>;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  onComplete,
  onRequestMic,
}) => {
  const [step, setStep] = useState(1);
  const [micGranted, setMicGranted] = useState(false);
  const [micError, setMicError] = useState('');
  const [selectedVoice, setSelectedVoice] = useState<PersonalityConfig['voice']>('Fenrir');
  const [selectedTone, setSelectedTone] = useState<PersonalityConfig['tone']>('calm');

  if (!isOpen) return null;

  const handleMicRequest = async () => {
    try {
      const ok = await onRequestMic();
      if (ok) {
        setMicGranted(true);
        setMicError('');
        setStep(3);
      } else {
        setMicError('Microphone permission was denied. You can continue using text fallback.');
      }
    } catch (e: any) {
      setMicError(e.message || 'Microphone access failed.');
    }
  };

  const finishOnboarding = () => {
    onComplete({
      name: 'NEUTRON',
      voice: selectedVoice,
      tone: selectedTone,
      verbosity: 'adaptive',
      proactivity: 'balanced',
      speechRate: 1.0,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-xl animate-fade-in">
      <div className="w-full max-w-lg rounded-3xl p-6 sm:p-8 bg-slate-950 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.25)] relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header indicator */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-xs font-mono tracking-widest text-cyan-400 uppercase">
              First-Run Initialization
            </span>
          </div>
          <span className="text-xs font-mono text-slate-500">Step {step} of 4</span>
        </div>

        {/* STEP 1: Introduction */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight text-slate-100">
                Welcome. I am NEUTRON.
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                Your personal AI operating system and intelligent digital agent. Designed to communicate naturally with real-time voice, reason about complex tasks, and execute multi-step workflows.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2.5 text-xs text-slate-300">
              <div className="flex items-center gap-2 text-cyan-300 font-mono">
                <Sparkles className="w-4 h-4" />
                <span>Core Capabilities</span>
              </div>
              <ul className="space-y-1.5 list-disc list-inside text-slate-400">
                <li>Real-time bidirectional voice powered by Google Gemini Live</li>
                <li>Living audio-reactive neural core visualization</li>
                <li>Autonomous tool execution with safety policy boundaries</li>
                <li>Persistent context, task planning, and project memory</li>
              </ul>
            </div>

            <button
              onClick={() => setStep(2)}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-medium text-slate-950 transition-all shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
            >
              Get Started
            </button>
          </div>
        )}

        {/* STEP 2: Microphone Activation */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="space-y-3">
              <h2 className="text-2xl font-bold tracking-tight text-slate-100">
                Enable Voice Pipeline
              </h2>
              <p className="text-sm text-slate-400 leading-relaxed">
                NEUTRON is voice-first. We need microphone access for real-time speech streaming and live audio-frequency visualization.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-cyan-950/20 border border-cyan-500/20 flex items-start gap-3 text-xs text-slate-300">
              <ShieldCheck className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-slate-200 mb-1">Privacy Guarantee</p>
                <p className="text-slate-400">
                  Audio is processed locally for visualization and streamed exclusively to your authorized Gemini session. Raw recordings are never stored on disk.
                </p>
              </div>
            </div>

            {micError && (
              <p className="text-xs text-rose-400 bg-rose-950/40 border border-rose-900 p-2.5 rounded-lg">
                {micError}
              </p>
            )}

            <div className="space-y-2">
              <button
                onClick={handleMicRequest}
                className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-medium text-slate-950 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer"
              >
                <Mic className="w-5 h-5" />
                <span>Grant Microphone Permission</span>
              </button>
              <button
                onClick={() => setStep(3)}
                className="w-full py-2.5 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Skip for now (Use Text Only)
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Voice Selection */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-100">
                Choose Voice Persona
              </h2>
              <p className="text-sm text-slate-400">
                Select your preferred Gemini Live prebuilt vocal timbre.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'Fenrir', desc: 'Deep, resonant, calm authority' },
                { id: 'Zephyr', desc: 'Smooth, warm, focused presence' },
                { id: 'Puck', desc: 'Energetic, clear, crisp articulate' },
                { id: 'Charon', desc: 'Rich, cinematic, understated' },
                { id: 'Kore', desc: 'Bright, balanced, analytical' },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setSelectedVoice(v.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedVoice === v.id
                      ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono font-medium text-sm text-slate-200">
                    <span>{v.id}</span>
                    {selectedVoice === v.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{v.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={() => setStep(4)}
              className="w-full py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-medium text-slate-950 transition-all cursor-pointer shadow-[0_0_20px_rgba(6,182,212,0.4)]"
            >
              Continue
            </button>
          </div>
        )}

        {/* STEP 4: Personality & Readiness */}
        {step === 4 && (
          <div className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight text-slate-100">
                Intelligence Tone
              </h2>
              <p className="text-sm text-slate-400">
                Configure how NEUTRON structures insights and reasoning.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { id: 'calm', label: 'Calm & Precise', desc: 'Measured cadence, zero clutter' },
                { id: 'intelligent', label: 'Deep Analytical', desc: 'System-level architectural insights' },
                { id: 'concise', label: 'Direct & Brief', desc: 'Rapid execution without pleasantries' },
                { id: 'warm', label: 'Warm & Adaptive', desc: 'Empathetic and conversational' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTone(t.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                    selectedTone === t.id
                      ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400/50'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between font-medium text-sm text-slate-200">
                    <span>{t.label}</span>
                    {selectedTone === t.id && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">{t.desc}</p>
                </button>
              ))}
            </div>

            <button
              onClick={finishOnboarding}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-400 to-sky-400 hover:from-cyan-300 hover:to-sky-300 font-semibold text-slate-950 transition-all shadow-[0_0_25px_rgba(6,182,212,0.5)] cursor-pointer"
            >
              Initialize NEUTRON
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
