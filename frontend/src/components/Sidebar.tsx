"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Shield, Table, Store, ChevronRight } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();

  const navItems = [
    { name: "Buyer Console", path: "/", icon: Home, symbol: "⌂" },
    { name: "Merchant Policy", path: "/policy", icon: Shield, symbol: "🛡" },
    { name: "Audit Log", path: "/audit", icon: Table, symbol: "◫" },
  ];

  return (
    <aside className="w-[240px] fixed left-0 top-[64px] bottom-0 bg-[#0b0e17] border-r border-slate-800/80 flex flex-col justify-between p-3 z-40 select-none">
      
      {/* Navigation Cards */}
      <div className="space-y-1 mt-2">
        <div className="px-3 py-1.5 text-[10px] uppercase font-mono tracking-wider text-slate-500 font-semibold">
          Control Navigation
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group ${
                isActive
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                  : "text-slate-400 hover:text-slate-100 hover:bg-slate-950/60 border border-transparent"
              }`}
            >
              <div className="flex items-center space-x-3">
                <span className="text-base">{item.symbol}</span>
                <span>{item.name}</span>
              </div>
              <ChevronRight
                className={`h-3.5 w-3.5 transition-transform ${
                  isActive ? "text-white translate-x-0.5" : "text-slate-600 group-hover:text-slate-400"
                }`}
              />
            </Link>
          );
        })}
      </div>

      {/* Bottom Merchant Account Badge */}
      <div className="bg-[#0e121e] border border-slate-800 rounded-xl p-3.5 space-y-2.5">
        <div className="flex items-center space-x-2.5">
          <div className="h-8 w-8 rounded-lg bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
            <Store className="h-4 w-4" />
          </div>
          <div className="truncate">
            <div className="text-xs font-bold text-white truncate">RunPro Sports</div>
            <div className="text-[10px] text-slate-400">Merchant Account</div>
          </div>
        </div>

        <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
          <span className="flex items-center space-x-1.5 font-bold text-emerald-400 font-mono">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>DEMO MODE</span>
          </span>
          <span className="text-[10px] font-mono text-slate-500">v1.0</span>
        </div>
      </div>

    </aside>
  );
}
