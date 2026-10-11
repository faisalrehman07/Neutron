import React, { useState } from 'react';
import { Send, Sparkles } from 'lucide-react';

interface TextInputBarProps {
  onSendMessage: (text: string) => void;
  disabled?: boolean;
}

const QUICK_PROMPTS = [
  'Good morning, Neutron',
  'What do I have planned today?',
  'Search the web for NVIDIA',
  'Find my presentation',
  'Create a folder called Projects',
  'Help me plan my day',
];

export const TextInputBar: React.FC<TextInputBarProps> = ({ onSendMessage, disabled = false }) => {
  const [input, setInput] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || disabled) return;
    onSendMessage(input.trim());
    setInput('');
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 space-y-2 pointer-events-auto">
      {/* Quick Prompts Carousel */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mr-1" />
        {QUICK_PROMPTS.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSendMessage(prompt)}
            disabled={disabled}
            className="text-xs font-sans whitespace-nowrap px-3 py-1 rounded-full bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-white/30 text-neutral-300 hover:text-white transition-all shrink-0 cursor-pointer disabled:opacity-50 backdrop-blur-md"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Field */}
      <form onSubmit={handleSubmit} className="relative flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask NEUTRON anything or enter a task..."
          disabled={disabled}
          className="w-full pl-4 pr-12 py-3 rounded-2xl bg-black/70 backdrop-blur-xl border border-white/10 focus:border-white/30 focus:ring-1 focus:ring-white/20 text-sm text-white placeholder-neutral-500 transition-all outline-none"
        />
        <button
          type="submit"
          disabled={!input.trim() || disabled}
          className="absolute right-2 p-2 rounded-xl bg-white hover:bg-neutral-200 disabled:bg-neutral-800 text-black disabled:text-neutral-500 transition-all cursor-pointer disabled:cursor-not-allowed shadow-[0_0_15px_rgba(255,255,255,0.25)] disabled:shadow-none"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
