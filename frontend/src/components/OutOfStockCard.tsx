"use client";

import { AlertTriangle, CheckCircle2, ArrowRight } from "lucide-react";

interface OutOfStockCardProps {
  outOfStockProduct: string;
  replacementProduct: any;
  onContinue: () => void;
}

export default function OutOfStockCard({
  outOfStockProduct,
  replacementProduct,
  onContinue,
}: OutOfStockCardProps) {
  return (
    <div className="bg-purple-950/20 border-2 border-purple-600/60 rounded-2xl p-6 shadow-2xl space-y-4 animate-fade-in">
      
      {/* Title */}
      <div className="flex items-center space-x-2 text-purple-400 font-extrabold text-sm uppercase tracking-wider font-mono border-b border-purple-900/50 pb-3">
        <AlertTriangle className="h-5 w-5 text-purple-400" />
        <span>PRODUCT UNAVAILABLE</span>
      </div>

      <div className="text-sm font-semibold text-white">
        <span className="text-purple-300 font-bold">{outOfStockProduct}</span> is no longer available. The agent is recovering...
      </div>

      {/* Recovery Trace */}
      <div className="bg-[#080a10] p-3 rounded-xl border border-purple-900/40 space-y-2 text-xs font-mono text-emerald-400">
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Searching alternatives in catalogue</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Comparing candidate ratings and delivery speeds</span>
        </div>
        <div className="flex items-center space-x-2">
          <CheckCircle2 className="h-3.5 w-3.5" />
          <span>Found suitable replacement: <strong>{replacementProduct?.name}</strong></span>
        </div>
      </div>

      {/* Replacement Product Preview */}
      {replacementProduct && (
        <div className="bg-[#080a10] border border-slate-800 rounded-xl p-4 flex items-center justify-between text-xs">
          <div>
            <div className="font-bold text-white text-sm">{replacementProduct.name}</div>
            <div className="text-slate-400 mt-0.5">Stock: {replacementProduct.stock} units &bull; Delivery: {replacementProduct.delivery_days} days</div>
          </div>
          <div className="text-right font-mono">
            <div className="font-bold text-indigo-400 text-sm">₹{replacementProduct.price.toLocaleString("en-IN")}</div>
            <div className="text-amber-400">★ {replacementProduct.rating}</div>
          </div>
        </div>
      )}

      {/* Button */}
      <div className="pt-2 flex justify-end">
        <button
          onClick={onContinue}
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-indigo-600/30 flex items-center space-x-1.5 cursor-pointer"
        >
          <span>Continue with Alternative</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

    </div>
  );
}
