"use client";

import { useState } from "react";
import { Bot, Zap, ShieldCheck, User, ChevronDown } from "lucide-react";
import UserLoginModal from "./UserLoginModal";
import { useSession } from "@/context/SessionContext";

export default function Navbar() {
  const [isSessionOpen, setIsSessionOpen] = useState(false);
  const { currentUser, setCurrentUser } = useSession();

  return (
    <header className="h-[64px] bg-[#0b0e17] border-b border-slate-800/80 fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 select-none">
      
      {/* Left Logo */}
      <div className="flex items-center space-x-3">
        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-lg shadow-lg shadow-indigo-600/30">
          ✦
        </div>
        <div>
          <div className="font-black text-lg tracking-tight text-white flex items-center space-x-1.5">
            <span>Agent<span className="text-indigo-400">Ready</span></span>
          </div>
          <p className="text-[9px] uppercase font-mono tracking-widest text-indigo-400/80 font-bold -mt-0.5">
            AI-NATIVE COMMERCE
          </p>
        </div>
      </div>

      {/* Center Tagline */}
      <div className="hidden md:flex items-center space-x-2 text-xs font-medium text-slate-400 bg-slate-900/60 px-3.5 py-1.5 rounded-full border border-slate-800">
        <ShieldCheck className="h-4 w-4 text-indigo-400" />
        <span>Policy-Controlled Agentic Commerce</span>
      </div>

      {/* Right Demo Mode Pill + User Session Badge */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2 bg-emerald-500/10 border border-emerald-500/30 px-3 py-1 rounded-full">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-extrabold text-emerald-400 font-mono tracking-wide">
            DEMO MODE
          </span>
        </div>

        <button
          onClick={() => setIsSessionOpen(true)}
          className="flex items-center space-x-2 bg-slate-900/60 hover:bg-slate-800 border border-slate-800 px-2.5 py-1.5 rounded-full transition-colors cursor-pointer"
        >
          <div className="h-6 w-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
            <User className="h-3.5 w-3.5" />
          </div>
          <span className="text-xs font-semibold text-slate-200 hidden sm:inline">
            {currentUser.label}
          </span>
          <ChevronDown className="h-3.5 w-3.5 text-slate-500" />
        </button>
      </div>

      <UserLoginModal
        isOpen={isSessionOpen}
        currentUser={currentUser}
        onClose={() => setIsSessionOpen(false)}
        onSwitchUser={(u) => {
          setCurrentUser(u);
          setIsSessionOpen(false);
        }}
      />

    </header>
  );
}
