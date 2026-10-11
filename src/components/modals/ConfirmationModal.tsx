import React from 'react';
import { AlertTriangle, ShieldAlert, Check, X } from 'lucide-react';
import { RiskLevel } from '../../types/tools';

interface ConfirmationModalProps {
  isOpen: boolean;
  toolName: string;
  args: Record<string, any>;
  riskLevel: RiskLevel;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  toolName,
  args,
  riskLevel,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  const isDestructive = riskLevel === 'DESTRUCTIVE';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-fade-in">
      <div
        className={`w-full max-w-md rounded-2xl p-6 bg-slate-950 border shadow-2xl transition-all ${
          isDestructive ? 'border-rose-500/50 shadow-rose-950/40' : 'border-amber-500/50 shadow-amber-950/40'
        }`}
      >
        {/* Header Icon & Title */}
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-3 rounded-xl ${
              isDestructive ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
            }`}
          >
            {isDestructive ? <ShieldAlert className="w-6 h-6" /> : <AlertTriangle className="w-6 h-6" />}
          </div>
          <div>
            <h3 className="text-base font-semibold text-slate-100">
              {isDestructive ? 'Destructive Action Confirmation' : 'Sensitive Action Approval'}
            </h3>
            <span
              className={`text-[10px] font-mono px-2 py-0.5 rounded uppercase tracking-wider ${
                isDestructive ? 'bg-rose-950/60 text-rose-300 border border-rose-800' : 'bg-amber-950/60 text-amber-300 border border-amber-800'
              }`}
            >
              {riskLevel} RISK POLICY
            </span>
          </div>
        </div>

        {/* Action Description */}
        <p className="text-sm text-slate-300 mb-4 leading-relaxed">
          NEUTRON is requesting authorization to execute{' '}
          <code className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 font-mono text-cyan-300">
            {toolName}
          </code>
          .
        </p>

        {/* Arguments Inspection */}
        <div className="mb-6 p-3 rounded-xl bg-slate-900/80 border border-slate-800">
          <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-2">
            Parameters:
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            {Object.entries(args).map(([key, val]) => (
              <div key={key} className="flex flex-col sm:flex-row sm:items-baseline gap-1">
                <span className="text-slate-400">{key}:</span>
                <span className="text-cyan-200 break-all">{JSON.stringify(val)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onCancel}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-700 bg-slate-900 hover:bg-slate-800 text-sm font-medium text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>

          <button
            onClick={onConfirm}
            className={`flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.4)]'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>Authorize & Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
};
