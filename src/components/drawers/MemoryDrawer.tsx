import React, { useState } from 'react';
import { X, Brain, Plus, Trash2, Pin, Sparkles } from 'lucide-react';
import { MemoryItem, MemoryCategory } from '../../types/memory';
import { globalMemoryStore } from '../../lib/memory/memoryStore';

interface MemoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  memories: MemoryItem[];
}

export const MemoryDrawer: React.FC<MemoryDrawerProps> = ({ isOpen, onClose, memories }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newCategory, setNewCategory] = useState<MemoryCategory>('PREFERENCES');
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');

  if (!isOpen) return null;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKey.trim() || !newValue.trim()) return;
    globalMemoryStore.add(newCategory, newKey.trim(), newValue.trim());
    setNewKey('');
    setNewValue('');
    setIsAdding(false);
  };

  const filteredMemories =
    selectedFilter === 'ALL'
      ? memories
      : memories.filter((m) => m.category === selectedFilter);

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[480px] bg-slate-950/95 backdrop-blur-2xl border-l border-cyan-500/20 shadow-2xl flex flex-col font-sans animate-slide-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
            Context & Memory Engine
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Categories Bar */}
      <div className="flex items-center gap-1.5 p-3 border-b border-slate-800/80 bg-slate-900/40 overflow-x-auto no-scrollbar text-xs">
        {['ALL', 'PREFERENCES', 'PROJECT_CONTEXT', 'TASK_MEMORY', 'LONG_TERM'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedFilter(cat)}
            className={`px-2.5 py-1 rounded-full whitespace-nowrap transition-colors cursor-pointer ${
              selectedFilter === cat
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200'
            }`}
          >
            {cat.replace('_', ' ')}
          </button>
        ))}
      </div>

      {/* Memory Items List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {filteredMemories.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Brain className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-xs">No memories stored in this category.</p>
          </div>
        ) : (
          filteredMemories.map((item) => (
            <div
              key={item.id}
              className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2 relative group hover:border-cyan-500/30 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/60 border border-cyan-800 text-cyan-300">
                  {item.category}
                </span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => globalMemoryStore.remove(item.id)}
                    className="p-1 rounded hover:bg-rose-950/80 text-slate-400 hover:text-rose-400 transition-colors"
                    title="Delete Memory"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-semibold text-slate-100 flex items-center gap-1.5">
                  {item.pinned && <Pin className="w-3 h-3 text-cyan-400" />}
                  {item.key}
                </h4>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">{item.value}</p>
              </div>

              <div className="text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Confidence: {Math.round(item.confidence * 100)}%</span>
                <span>{new Date(item.updatedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))
        )}

        {/* Add Memory Form */}
        {isAdding ? (
          <form onSubmit={handleAdd} className="p-4 rounded-xl bg-slate-900 border border-cyan-500/40 space-y-3">
            <div className="text-xs font-semibold text-cyan-300">New Memory Entry</div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Category</label>
              <select
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value as any)}
                className="w-full p-2 text-xs rounded bg-slate-950 border border-slate-800 text-slate-200 outline-none"
              >
                <option value="PREFERENCES">Preferences</option>
                <option value="PROJECT_CONTEXT">Project Context</option>
                <option value="TASK_MEMORY">Task Memory</option>
                <option value="LONG_TERM">Long Term</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Concept / Key</label>
              <input
                type="text"
                value={newKey}
                onChange={(e) => setNewKey(e.target.value)}
                placeholder="e.g. Favorite Editor, Tech Stack"
                className="w-full p-2 text-xs rounded bg-slate-950 border border-slate-800 text-slate-200 outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Memory Content</label>
              <textarea
                value={newValue}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder="Specific context to remember..."
                rows={2}
                className="w-full p-2 text-xs rounded bg-slate-950 border border-slate-800 text-slate-200 outline-none"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="px-3 py-1.5 text-xs rounded bg-slate-800 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-3 py-1.5 text-xs rounded bg-cyan-500 hover:bg-cyan-400 font-semibold text-slate-950"
              >
                Save
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setIsAdding(true)}
            className="w-full py-2.5 rounded-xl border border-dashed border-slate-800 hover:border-cyan-500/50 text-xs font-mono text-slate-400 hover:text-cyan-300 flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Store New Context</span>
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/30 flex items-center justify-between text-xs text-slate-500">
        <span>{memories.length} memories retained</span>
        <button
          onClick={() => {
            if (confirm('Clear all stored context?')) globalMemoryStore.clear();
          }}
          className="text-[11px] text-rose-400/80 hover:text-rose-300 transition-colors"
        >
          Clear Memory
        </button>
      </div>
    </div>
  );
};
