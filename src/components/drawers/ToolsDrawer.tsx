import React, { useState } from 'react';
import { X, Wrench, Shield, Play, Terminal, CheckCircle2, AlertTriangle, ShieldAlert } from 'lucide-react';
import { NEUTRON_TOOLS } from '../../lib/tools/registry';
import { globalActionExecutor } from '../../lib/tools/executor';
import { ToolDefinition, ToolExecutionResult } from '../../types/tools';

interface ToolsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onRequestConfirm: (toolName: string, args: any, riskLevel: any, cb: () => void) => void;
}

export const ToolsDrawer: React.FC<ToolsDrawerProps> = ({
  isOpen,
  onClose,
  onRequestConfirm,
}) => {
  const [selectedTool, setSelectedTool] = useState<ToolDefinition | null>(null);
  const [testArgs, setTestArgs] = useState<string>('{}');
  const [testResult, setTestResult] = useState<ToolExecutionResult | null>(null);
  const [isExecuting, setIsExecuting] = useState(false);

  if (!isOpen) return null;

  const handleSelect = (tool: ToolDefinition) => {
    setSelectedTool(tool);
    setTestResult(null);
    // Provide sensible default test arguments
    if (tool.name === 'searchWeb') setTestArgs('{"query": "Gemini Live API"}');
    else if (tool.name === 'searchFiles') setTestArgs('{"query": "presentation"}');
    else if (tool.name === 'createFileOrFolder') setTestArgs('{"name": "test_folder", "type": "folder"}');
    else if (tool.name === 'deleteFile') setTestArgs('{"name": "test_folder"}');
    else if (tool.name === 'calculate') setTestArgs('{"expression": "48 * 12"}');
    else if (tool.name === 'sendMessage') setTestArgs('{"recipient": "John Smith", "message": "Running 10 mins late"}');
    else if (tool.name === 'getCalendarSchedule') setTestArgs('{"date": "today"}');
    else if (tool.name === 'createReminder') setTestArgs('{"text": "Briefing", "time": "in 1 hour"}');
    else setTestArgs('{}');
  };

  const executeTest = async () => {
    if (!selectedTool) return;
    try {
      const parsedArgs = JSON.parse(testArgs);
      setIsExecuting(true);

      const run = async () => {
        const res = await globalActionExecutor.executeTool(selectedTool.name, parsedArgs);
        setTestResult(res);
        setIsExecuting(false);
      };

      if (selectedTool.riskLevel !== 'SAFE') {
        onRequestConfirm(selectedTool.name, parsedArgs, selectedTool.riskLevel, run);
      } else {
        await run();
      }
    } catch (e: any) {
      alert('Invalid JSON in arguments: ' + e.message);
      setIsExecuting(false);
    }
  };

  return (
    <div className="fixed inset-y-0 right-0 z-40 w-full sm:w-[520px] bg-slate-950/95 backdrop-blur-2xl border-l border-cyan-500/20 shadow-2xl flex flex-col font-sans animate-slide-left">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-mono font-bold tracking-wider text-slate-100 uppercase">
            Tool Registry & Policy Sandbox
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tool Selector / Cards */}
        <div className="grid grid-cols-1 gap-2.5">
          {NEUTRON_TOOLS.map((tool) => (
            <button
              key={tool.name}
              onClick={() => handleSelect(tool)}
              className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                selectedTool?.name === tool.name
                  ? 'bg-cyan-950/40 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400/40'
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-mono text-xs font-semibold text-slate-100">
                  {tool.name}
                </span>
                <span
                  className={`text-[9px] font-mono px-2 py-0.5 rounded font-bold uppercase tracking-wider ${
                    tool.riskLevel === 'DESTRUCTIVE'
                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                      : tool.riskLevel === 'SENSITIVE'
                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  }`}
                >
                  {tool.riskLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{tool.description}</p>
            </button>
          ))}
        </div>

        {/* Selected Tool Sandbox & Inspection */}
        {selectedTool && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between text-cyan-300 font-semibold">
              <span>Execute Sandbox: {selectedTool.name}</span>
              {selectedTool.requiredPermission && (
                <span className="text-[10px] text-slate-400">
                  Perm: {selectedTool.requiredPermission}
                </span>
              )}
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">JSON Arguments</label>
              <textarea
                rows={3}
                value={testArgs}
                onChange={(e) => setTestArgs(e.target.value)}
                className="w-full p-2.5 rounded-lg bg-black/60 border border-slate-800 text-cyan-200 font-mono text-xs outline-none"
              />
            </div>

            <button
              onClick={executeTest}
              disabled={isExecuting}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:bg-slate-800 text-slate-950 font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-[0_0_15px_rgba(6,182,212,0.3)]"
            >
              <Play className="w-4 h-4 fill-slate-950" />
              <span>{isExecuting ? 'Running...' : 'Execute with Policy Check'}</span>
            </button>

            {/* Execution Result */}
            {testResult && (
              <div className="mt-3 p-3 rounded-xl bg-black/70 border border-slate-800 space-y-1.5 text-[11px]">
                <div className="flex items-center justify-between">
                  <span
                    className={
                      testResult.success ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'
                    }
                  >
                    {testResult.success ? 'STATUS: SUCCESS' : 'STATUS: FAILED'}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                    MODE: {testResult.executionMode}
                  </span>
                </div>
                {testResult.message && <p className="text-slate-200">{testResult.message}</p>}
                {testResult.data && (
                  <pre className="p-2 rounded bg-slate-950 text-cyan-300 overflow-x-auto text-[10px]">
                    {JSON.stringify(testResult.data, null, 2)}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
