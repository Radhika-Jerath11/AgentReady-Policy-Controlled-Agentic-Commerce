"use client";

import { ShieldAlert, ArrowRight } from "lucide-react";

interface PolicyViolationCardProps {
  onUseMaxAllowed: () => void;
}

export default function PolicyViolationCard({ onUseMaxAllowed }: PolicyViolationCardProps) {
  return (
    <div className="bg-rose-950/20 border-2 border-rose-600/60 rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-rose-900/50 pb-3">
        <div className="flex items-center space-x-2 text-rose-400 font-extrabold text-sm uppercase tracking-wider font-mono">
          <ShieldAlert className="h-5 w-5 shrink-0 text-rose-500" />
          <span>POLICY ENGINE</span>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 font-mono">
          ACTION BLOCKED
        </span>
      </div>

      {/* Grid Comparison */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
        <div className="bg-[#080a10] p-3.5 rounded-xl border border-rose-900/40 space-y-1">
          <span className="text-slate-400">Agent Requested:</span>
          <div className="text-rose-400 font-extrabold text-base">20% discount</div>
        </div>

        <div className="bg-[#080a10] p-3.5 rounded-xl border border-slate-800 space-y-1">
          <span className="text-slate-400">Merchant Allows:</span>
          <div className="text-emerald-400 font-extrabold text-base">10% maximum</div>
        </div>
      </div>

      {/* Reason */}
      <div className="bg-[#080a10] p-3.5 rounded-xl border border-rose-900/40 text-xs font-mono text-rose-300">
        Reason: &ldquo;Requested action exceeds merchant-defined policy.&rdquo;
      </div>

      {/* Subtext & Button */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-xs font-semibold text-slate-400">
          Agent cannot override merchant policy.
        </span>

        <button
          onClick={onUseMaxAllowed}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 cursor-pointer shrink-0"
        >
          <span>Use Maximum Allowed 10%</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
