"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, ShieldAlert, XCircle, Search, Filter, RefreshCw } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/api";

export default function AuditLogPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [decisionFilter, setDecisionFilter] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE}/agent/audit-logs?limit=100`);
      const data = await res.json();
      setLogs(data);
    } catch (err) {
      console.error("Failed to fetch audit logs", err);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesDecision = decisionFilter === "ALL" || log.decision === decisionFilter;
    const matchesQuery =
      !searchQuery ||
      log.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.reason && log.reason.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesDecision && matchesQuery;
  });

  const getDecisionBadge = (decision: string) => {
    switch (decision) {
      case "ALLOWED":
      case "SUCCESS":
      case "EXECUTED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
            <CheckCircle2 className="h-3 w-3" />
            <span>{decision === "EXECUTED" ? "SUCCESS" : decision}</span>
          </span>
        );
      case "BLOCKED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono">
            <ShieldAlert className="h-3 w-3" />
            <span>BLOCKED</span>
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/30 font-mono">
            <XCircle className="h-3 w-3" />
            <span>FAILED</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-slate-800 text-slate-300">
            {decision}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Audit Log</h1>
          <p className="text-xs text-slate-400 mt-1">Immutable trajectory trace of all agent evaluations and policy decisions</p>
        </div>

        <button
          onClick={fetchAuditLogs}
          disabled={isLoading}
          className="bg-[#0e121e] hover:bg-slate-800 text-slate-300 border border-slate-800 px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition-colors cursor-pointer"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? "animate-spin" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#0e121e] border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Search */}
        <div className="relative flex-1 w-full">
          <Search className="h-4 w-4 text-slate-500 absolute left-3.5 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter by agent, action, or reason..."
            className="w-full bg-[#080a10] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
          />
        </div>

        {/* Status Filter Buttons */}
        <div className="flex items-center space-x-1 bg-[#080a10] p-1 rounded-xl border border-slate-800 text-xs shrink-0 font-mono">
          <Filter className="h-3.5 w-3.5 text-slate-500 ml-2 mr-1" />
          {["ALL", "ALLOWED", "BLOCKED", "EXECUTED", "FAILED"].map((dec) => (
            <button
              key={dec}
              onClick={() => setDecisionFilter(dec)}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                decisionFilter === dec
                  ? "bg-indigo-600 text-white font-bold"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              {dec === "EXECUTED" ? "SUCCESS" : dec}
            </button>
          ))}
        </div>

      </div>

      {/* Data Table */}
      <div className="bg-[#0e121e] border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#080a10] border-b border-slate-800 text-slate-400 font-mono uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">TIME</th>
                <th className="py-3.5 px-4">AGENT</th>
                <th className="py-3.5 px-4">ACTION</th>
                <th className="py-3.5 px-4">DECISION</th>
                <th className="py-3.5 px-4">REASON</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#080a10]/60 transition-colors">
                    <td className="py-3.5 px-4 text-slate-400 whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                        second: "2-digit",
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-200">{log.agent}</td>
                    <td className="py-3.5 px-4 text-indigo-400">{log.action}</td>
                    <td className="py-3.5 px-4">{getDecisionBadge(log.decision)}</td>
                    <td className="py-3.5 px-4 text-slate-300 max-w-lg truncate">
                      {log.reason}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-slate-500 font-mono">
                    No audit log entries match the selected filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
