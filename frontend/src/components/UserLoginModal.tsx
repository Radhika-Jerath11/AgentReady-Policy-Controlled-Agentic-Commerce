"use client";

import { X, User, ShieldCheck, RefreshCw } from "lucide-react";

export interface SessionUser {
  role: "buyer" | "admin";
  email: string;
  label: string;
}

export const DEFAULT_SESSION_USER: SessionUser = {
  role: "buyer",
  email: "buyer@runpro.com",
  label: "Demo Buyer",
};

const SESSION_USERS: SessionUser[] = [
  { role: "buyer", email: "buyer@runpro.com", label: "Demo Buyer" },
  { role: "admin", email: "admin@runpro.com", label: "Merchant Administrator" },
];

interface UserLoginModalProps {
  isOpen: boolean;
  currentUser: SessionUser;
  onClose: () => void;
  onSwitchUser: (user: SessionUser) => void;
}

export default function UserLoginModal({
  isOpen,
  currentUser,
  onClose,
  onSwitchUser,
}: UserLoginModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0e131f] border border-slate-700/80 rounded-2xl max-w-sm w-full p-6 shadow-2xl relative space-y-5">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <h3 className="text-lg font-extrabold text-white">Session</h3>
          <p className="text-xs text-slate-400 mt-1">
            Switch between demo roles to preview permissions.
          </p>
        </div>

        <div className="space-y-2">
          {SESSION_USERS.map((u) => {
            const active = u.email === currentUser.email;
            return (
              <button
                key={u.email}
                onClick={() => onSwitchUser(u)}
                className={`w-full flex items-center justify-between p-3.5 rounded-xl border transition-all text-left cursor-pointer ${
                  active
                    ? "bg-indigo-600/15 border-indigo-500/50"
                    : "bg-[#080b12] border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center shrink-0 ${
                      active
                        ? "bg-indigo-500/20 text-indigo-300"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    <User className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-white">{u.label}</div>
                    <div className="text-[11px] text-slate-400 font-mono">{u.email}</div>
                  </div>
                </div>
                {active && <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />}
              </button>
            );
          })}
        </div>

        <div className="text-[11px] text-slate-500 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800 flex items-start space-x-2">
          <RefreshCw className="h-3.5 w-3.5 shrink-0 mt-0.5" />
          <span>Role switching is simulated for demo purposes — no re-authentication required.</span>
        </div>
      </div>
    </div>
  );
}
