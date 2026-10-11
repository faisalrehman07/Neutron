import React, { useState } from 'react';
import { X, Sliders, Volume2, Sparkles, Shield, Cpu, RefreshCw, Check } from 'lucide-react';
import { PersonalityConfig } from '../../types/ai';
import { VisualSettings } from '../../types/audio';
import { globalPermissionManager, PermissionRecord } from '../../lib/permissions/permissionManager';
import { autonomousBrain } from '../../lib/conversation/AutonomousBrain';
import { Key } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  personality: PersonalityConfig;
  onUpdatePersonality: (config: PersonalityConfig) => void;
  visualSettings: VisualSettings;
  onUpdateVisualSettings: (settings: VisualSettings) => void;
  onReconnect: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  personality,
  onUpdatePersonality,
  visualSettings,
  onUpdateVisualSettings,
  onReconnect,
}) => {
  const [activeTab, setActiveTab] = useState<'VOICE' | 'NEURAL' | 'PERMISSIONS' | 'CORE'>('NEURAL');
  const [apiKeyInput, setApiKeyInput] = useState(autonomousBrain.getApiKey());
  const [apiKeySaved, setApiKeySaved] = useState(false);
  const [permissions, setPermissions] = useState<PermissionRecord[]>(
    globalPermissionManager.getAll()
  );

  if (!isOpen) return null;

  const togglePermission = (id: string) => {
    const current = globalPermissionManager.get(id);
    const next = current === 'GRANTED' ? 'DENIED' : 'GRANTED';
    globalPermissionManager.set(id, next);
    setPermissions(globalPermissionManager.getAll());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-fade-in font-sans">
      <div className="w-full max-w-xl rounded-3xl bg-slate-950 border border-cyan-500/30 shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-5 h-5 text-cyan-400" />
            <h2 className="text-base font-bold text-slate-100 font-mono tracking-wider uppercase">
              System Settings & Architecture
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Nav */}
        <div className="flex border-b border-slate-800 bg-slate-900/50 text-xs font-mono">
          <button
            onClick={() => setActiveTab('NEURAL')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'NEURAL'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Neural Core Shaders
          </button>
          <button
            onClick={() => setActiveTab('VOICE')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'VOICE'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Voice & Persona
          </button>
          <button
            onClick={() => setActiveTab('PERMISSIONS')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'PERMISSIONS'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Security & Permissions
          </button>
          <button
            onClick={() => setActiveTab('CORE')}
            className={`flex-1 py-3 text-center border-b-2 transition-colors cursor-pointer ${
              activeTab === 'CORE'
                ? 'border-cyan-400 text-cyan-300 font-bold bg-slate-900/80'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            API & Live Core
          </button>
        </div>

        {/* Tab Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* NEURAL INTERFACE SHADER SETTINGS */}
          {activeTab === 'NEURAL' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-2 uppercase tracking-wider">
                  Rendering Quality Profile
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['auto', 'high', 'medium', 'low'] as const).map((q) => (
                    <button
                      key={q}
                      onClick={() => onUpdateVisualSettings({ ...visualSettings, quality: q })}
                      className={`py-2 rounded-xl text-xs font-mono capitalize transition-all cursor-pointer ${
                        visualSettings.quality === q
                          ? 'bg-cyan-500 text-slate-950 font-bold shadow-[0_0_15px_rgba(6,182,212,0.4)]'
                          : 'bg-slate-900 border border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              {/* Fluid Intensity Slider */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300 font-mono">
                  <span>Neural Fluid Reactivity</span>
                  <span className="text-cyan-400">{visualSettings.fluidIntensity}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={visualSettings.fluidIntensity}
                  onChange={(e) =>
                    onUpdateVisualSettings({
                      ...visualSettings,
                      fluidIntensity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Particle Density */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300 font-mono">
                  <span>Particle Orbital Density</span>
                  <span className="text-cyan-400">{visualSettings.particleDensity}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.5"
                  step="0.1"
                  value={visualSettings.particleDensity}
                  onChange={(e) =>
                    onUpdateVisualSettings({
                      ...visualSettings,
                      particleDensity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Glow Intensity */}
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs text-slate-300 font-mono">
                  <span>Aura & Glow Intensity</span>
                  <span className="text-cyan-400">{visualSettings.glowIntensity}x</span>
                </div>
                <input
                  type="range"
                  min="0.4"
                  max="1.6"
                  step="0.1"
                  value={visualSettings.glowIntensity}
                  onChange={(e) =>
                    onUpdateVisualSettings({
                      ...visualSettings,
                      glowIntensity: parseFloat(e.target.value),
                    })
                  }
                  className="w-full accent-cyan-400 cursor-pointer"
                />
              </div>

              {/* Reduced Motion Toggle */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <div>
                  <div className="text-xs font-semibold text-slate-200">Reduced Motion</div>
                  <div className="text-[11px] text-slate-500">
                    Minimizes camera parallax and dynamic turbulence for accessibility.
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={visualSettings.reducedMotion}
                  onChange={(e) =>
                    onUpdateVisualSettings({
                      ...visualSettings,
                      reducedMotion: e.target.checked,
                    })
                  }
                  className="w-4 h-4 accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* VOICE & PERSONA */}
          {activeTab === 'VOICE' && (
            <div className="space-y-5">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-2 uppercase tracking-wider">
                  Voice Timbre (Gemini Live)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['Fenrir', 'Zephyr', 'Puck', 'Charon', 'Kore'] as const).map((voice) => (
                    <button
                      key={voice}
                      onClick={() => onUpdatePersonality({ ...personality, voice })}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        personality.voice === voice
                          ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-mono font-medium text-xs text-slate-200">
                        <span>{voice}</span>
                        {personality.voice === voice && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-2 uppercase tracking-wider">
                  Conversational Cadence & Tone
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(['calm', 'intelligent', 'concise', 'warm'] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => onUpdatePersonality({ ...personality, tone: t })}
                      className={`p-3 rounded-xl border text-left capitalize transition-all cursor-pointer ${
                        personality.tone === t
                          ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between font-medium text-xs text-slate-200">
                        <span>{t}</span>
                        {personality.tone === t && <Check className="w-3.5 h-3.5 text-cyan-400" />}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-2 uppercase tracking-wider">
                  Proactivity Level
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['off', 'low', 'balanced', 'high'] as const).map((p) => (
                    <button
                      key={p}
                      onClick={() => onUpdatePersonality({ ...personality, proactivity: p })}
                      className={`py-2 rounded-xl text-xs font-mono capitalize transition-all cursor-pointer ${
                        personality.proactivity === p
                          ? 'bg-cyan-500 text-slate-950 font-bold'
                          : 'bg-slate-900 border border-slate-800 text-slate-400'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={onReconnect}
                  className="w-full py-2.5 rounded-xl border border-cyan-500/40 bg-cyan-950/20 hover:bg-cyan-950/40 text-xs font-mono text-cyan-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Restart Gemini Live Session with New Voice</span>
                </button>
              </div>
            </div>
          )}

          {/* PERMISSIONS */}
          {activeTab === 'PERMISSIONS' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-400 mb-2">
                Control access to authorized device sensors and workspace capabilities.
              </p>
              {permissions.map((perm) => (
                <div
                  key={perm.id}
                  className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between"
                >
                  <div className="space-y-0.5 pr-4">
                    <div className="text-xs font-semibold text-slate-200">{perm.name}</div>
                    <div className="text-[11px] text-slate-400 leading-normal">
                      {perm.description}
                    </div>
                  </div>
                  <button
                    onClick={() => togglePermission(perm.id)}
                    className={`px-3 py-1 rounded-full text-xs font-mono font-semibold transition-all cursor-pointer ${
                      perm.state === 'GRANTED'
                        ? 'bg-emerald-500 text-slate-950'
                        : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {perm.state}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* API & CORE SETTINGS */}
          {activeTab === 'CORE' && (
            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
                <div className="flex items-center gap-2 text-cyan-400 font-mono text-xs font-semibold uppercase">
                  <Key className="w-4 h-4" />
                  <span>Client-Side Gemini API Key</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Provide your Gemini API key to enable direct in-browser neural reasoning and tools when deployed statically (e.g. on GitHub Pages) without needing a local Node.js bridge.
                </p>
                <div className="space-y-2">
                  <input
                    type="password"
                    value={apiKeyInput}
                    onChange={(e) => {
                      setApiKeyInput(e.target.value);
                      setApiKeySaved(false);
                    }}
                    placeholder="AIzaSy..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-black/60 border border-slate-700 focus:border-cyan-400 text-xs font-mono text-white outline-none"
                  />
                  <div className="flex justify-between items-center pt-1">
                    <span className="text-[11px] text-slate-500 font-mono">
                      {apiKeySaved ? '✓ Key securely stored in browser' : 'Key stored in localStorage only'}
                    </span>
                    <button
                      onClick={() => {
                        autonomousBrain.setApiKey(apiKeyInput);
                        setApiKeySaved(true);
                      }}
                      className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono cursor-pointer transition-colors"
                    >
                      Save Key
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                <div className="text-cyan-400 font-mono font-semibold uppercase text-xs">
                  Autonomous Operating Core
                </div>
                <p className="text-slate-400 leading-relaxed">
                  When neither the WebSocket bridge nor an API key is available, NEUTRON automatically activates its built-in Autonomous Neural Simulator, running real-time speech synthesis, file search simulation, calendar schedule, task dispatcher, and holographic visualizers seamlessly.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 font-semibold text-xs text-slate-950 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.4)]"
          >
            Apply & Close
          </button>
        </div>
      </div>
    </div>
  );
};
