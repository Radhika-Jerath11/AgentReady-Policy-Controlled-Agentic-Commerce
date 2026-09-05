"use client";

import { AlertTriangle, RefreshCw, X } from "lucide-react";

interface PaymentFailureCardProps {
  onRetry: () => void;
  onCancel: () => void;
}

export default function PaymentFailureCard({ onRetry, onCancel }: PaymentFailureCardProps) {
  return (
    <div className="bg-rose-950/20 border-2 border-rose-600/60 rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
      
      {/* Title */}
      <div className="flex items-center space-x-2 text-rose-400 font-extrabold text-sm uppercase tracking-wider font-mono border-b border-rose-900/50 pb-3">
        <AlertTriangle className="h-5 w-5 text-rose-500" />
        <span>PAYMENT NOT COMPLETED</span>
      </div>

      <div className="space-y-1 text-xs font-mono text-slate-300">
        <p className="text-sm font-bold text-white">The payment could not be completed.</p>
        <p className="text-rose-300">&bull; Order remains unconfirmed in PAYMENT_PENDING/FAILED state.</p>
        <p className="text-slate-400">&bull; Payment status verified on backend. No duplicate charges occurred.</p>
      </div>

      {/* Buttons */}
      <div className="pt-2 flex items-center space-x-3 justify-end">
        <button
          onClick={onCancel}
          className="py-2.5 px-4 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all cursor-pointer flex items-center space-x-1.5"
        >
          <X className="h-3.5 w-3.5" />
          <span>Cancel Order</span>
        </button>

        <button
          onClick={onRetry}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 cursor-pointer"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          <span>Retry Payment</span>
        </button>
      </div>

    </div>
  );
}
