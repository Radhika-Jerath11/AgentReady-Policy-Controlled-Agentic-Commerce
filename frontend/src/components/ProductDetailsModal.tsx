"use client";

import { X, Package, Truck, Star, Sparkles, ArrowRight } from "lucide-react";

interface ProductDetailsModalProps {
  isOpen: boolean;
  product: any;
  onClose: () => void;
  onProceed: () => void;
}

export default function ProductDetailsModal({
  isOpen,
  product,
  onClose,
  onProceed,
}: ProductDetailsModalProps) {
  if (!isOpen || !product) return null;

  const specs: string[] = (product.specifications || "")
    .split("|")
    .map((s: string) => s.trim())
    .filter(Boolean);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0e131f] border border-slate-700/80 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
        >
          <X className="h-5 w-5" />
        </button>

        <div>
          <div className="text-xs text-indigo-400 font-mono uppercase tracking-wider mb-1">
            {product.category}
          </div>
          <h3 className="text-xl font-extrabold text-white pr-8">{product.name}</h3>
          <div className="flex items-center space-x-3 mt-1 text-xs text-slate-400">
            <span className="flex items-center space-x-1 text-amber-400 font-bold">
              <Star className="h-3.5 w-3.5 fill-amber-400" />
              <span>{product.rating}</span>
            </span>
            <span className="font-mono text-indigo-300">
              ₹{Number(product.price || 0).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {product.description && (
          <p className="text-sm text-slate-300 leading-relaxed">{product.description}</p>
        )}

        {specs.length > 0 && (
          <div className="bg-[#080b12] border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Technical Specifications
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {specs.map((s, i) => (
                <div key={i} className="flex items-center space-x-2 text-slate-300">
                  <span className="h-1 w-1 rounded-full bg-indigo-400 shrink-0" />
                  <span>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="bg-[#080b12] border border-slate-800 rounded-xl p-3 flex items-center space-x-2">
            <Package className="h-4 w-4 text-indigo-400 shrink-0" />
            <div>
              <div className="text-slate-500">Stock</div>
              <div className="font-bold text-slate-200">{product.stock} units</div>
            </div>
          </div>
          <div className="bg-[#080b12] border border-slate-800 rounded-xl p-3 flex items-center space-x-2">
            <Truck className="h-4 w-4 text-emerald-400 shrink-0" />
            <div>
              <div className="text-slate-500">Delivery</div>
              <div className="font-bold text-slate-200">{product.delivery_days} days</div>
            </div>
          </div>
        </div>

        {product.recommendation_reason && (
          <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-3.5 text-xs text-indigo-200 flex items-start space-x-2">
            <Sparkles className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
            <span>{product.recommendation_reason}</span>
          </div>
        )}

        <button
          onClick={onProceed}
          className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          <span>Proceed to Purchase</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
