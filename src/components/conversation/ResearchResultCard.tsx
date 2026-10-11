import React, { useState } from 'react';
import { ResearchResult } from '../../types/research';
import { ExternalLink, Copy, Check, ChevronDown, ChevronUp, Globe, MessageSquare } from 'lucide-react';

interface ResearchResultCardProps {
  result: ResearchResult;
  index: number;
  onAskAbout: (sourceTitle: string) => void;
}

export const ResearchResultCard: React.FC<ResearchResultCardProps> = ({
  result,
  index,
  onAskAbout,
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  // Extract clean domain
  const getDomain = (urlStr: string) => {
    try {
      const parsed = new URL(urlStr);
      return parsed.hostname.replace(/^www\./, '');
    } catch {
      return result.domain || 'web source';
    }
  };

  const domain = getDomain(result.url);

  const handleCopy = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(result.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="group p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 hover:border-emerald-500/30 transition-all duration-200 shadow-lg space-y-3">
      {/* Header with Source Badge & Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-5 h-5 rounded-md bg-white/[0.06] flex items-center justify-center text-[10px] font-mono text-neutral-400">
            #{index + 1}
          </span>
          <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/[0.05] border border-white/10 text-[11px] font-mono text-neutral-300">
            <Globe className="w-3 h-3 text-emerald-400" />
            <span className="truncate max-w-[140px] sm:max-w-[200px]">{domain}</span>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
          <button
            onClick={handleCopy}
            title="Copy URL"
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
          <a
            href={result.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Source Link"
            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* Title */}
      <a
        href={result.url}
        target="_blank"
        rel="noopener noreferrer"
        className="block font-medium text-sm text-neutral-100 group-hover:text-emerald-300 transition-colors leading-snug"
      >
        {result.title}
      </a>

      {/* Snippet */}
      {result.snippet && (
        <p
          className={`text-xs text-neutral-400 leading-relaxed transition-all ${
            expanded ? '' : 'line-clamp-2'
          }`}
        >
          {result.snippet}
        </p>
      )}

      {/* Footer Details & Follow-up Action */}
      <div className="flex items-center justify-between pt-1 text-[11px] font-mono text-neutral-400">
        {result.snippet && result.snippet.length > 120 ? (
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1 hover:text-neutral-200 transition-colors cursor-pointer"
          >
            <span>{expanded ? 'Less' : 'More'}</span>
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        ) : (
          <span />
        )}

        <button
          onClick={() => onAskAbout(result.title)}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-950/40 hover:bg-emerald-900/50 border border-emerald-500/30 text-emerald-300 transition-colors cursor-pointer"
        >
          <MessageSquare className="w-3 h-3" />
          <span>Ask NEUTRON</span>
        </button>
      </div>
    </div>
  );
};
