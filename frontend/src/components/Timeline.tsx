"use client";

import { CheckCircle2, ShieldAlert, XCircle, Clock, Loader2 } from "lucide-react";

export interface TimelineStep {
  icon: string;
  title: string;
  status: "pending" | "running" | "success" | "blocked" | "failed" | "RUNNING" | "SUCCESS" | "BLOCKED" | "FAILED" | "WAITING" | "ALLOWED";
  detail: string;
}

interface TimelineProps {
  steps: TimelineStep[];
}

export default function Timeline({ steps }: TimelineProps) {
  const normalizeStatus = (st: string) => {
    const s = st.toUpperCase();
    if (s === "PENDING") return "WAITING";
    return s;
  };

  const getStatusBadge = (rawStatus: string) => {
    const status = normalizeStatus(rawStatus);
    switch (status) {
      case "SUCCESS":
      case "ALLOWED":
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
            <CheckCircle2 className="h-3 w-3" />
            <span>{status}</span>
          </span>
        );
      case "BLOCKED":
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono">
            <ShieldAlert className="h-3 w-3" />
            <span>BLOCKED</span>
          </span>
        );
      case "FAILED":
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono">
            <XCircle className="h-3 w-3" />
            <span>FAILED</span>
          </span>
        );
      case "RUNNING":
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-400 border border-blue-500/30 font-mono animate-pulse">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>RUNNING</span>
          </span>
        );
      default:
        return (
          <span className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono">
            <Clock className="h-3 w-3" />
            <span>WAITING</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0e121e] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div>
          <h3 className="font-extrabold text-base text-white">Agent Activity</h3>
          <p className="text-xs text-slate-400">Real-time execution trace</p>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest bg-slate-900 px-2.5 py-1 rounded-md border border-slate-800">
          TRAJECTORY
        </span>
      </div>

      <div className="relative pl-6 space-y-3.5 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
        {steps.map((step, index) => {
          const normStatus = normalizeStatus(step.status);
          return (
            <div key={index} className="relative flex items-start space-x-3 group">
              {/* Node Dot */}
              <div
                className={`absolute -left-6 top-1 h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                  normStatus === "SUCCESS" || normStatus === "ALLOWED"
                    ? "bg-emerald-950 text-emerald-400 border border-emerald-500/60"
                    : normStatus === "BLOCKED" || normStatus === "FAILED"
                    ? "bg-rose-950 text-rose-400 border border-rose-500/60"
                    : normStatus === "RUNNING"
                    ? "bg-blue-950 text-blue-400 border border-blue-500/60 animate-pulse"
                    : "bg-amber-950 text-amber-400 border border-amber-500/60"
                }`}
              >
                ●
              </div>

              {/* Event Content Card */}
              <div className="flex-1 bg-[#080a10] border border-slate-800/80 rounded-xl p-3 hover:border-slate-700/80 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-base">{step.icon}</span>
                    <span className="font-bold text-xs text-slate-200">{step.title}</span>
                  </div>
                  {getStatusBadge(step.status)}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed font-mono mt-0.5">{step.detail}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
