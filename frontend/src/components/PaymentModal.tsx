"use client";

import { ShieldCheck, Lock, CheckCircle2, AlertCircle, X } from "lucide-react";

interface PaymentOrderSummary {
  order_id: string;
  cart_id: string;
  product_name: string;
  original_price: number;
  discount_percentage: number;
  discount_amount: number;
  final_amount: number;
  delivery_days: number;
  status: string;
}

interface PaymentModalProps {
  isOpen: boolean;
  orderSummary: PaymentOrderSummary | null;
  onApprove: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function PaymentModal({
  isOpen,
  orderSummary,
  onApprove,
  onCancel,
  isLoading,
}: PaymentModalProps) {
  if (!isOpen || !orderSummary) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-[#0e131f] border border-slate-700/80 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="flex items-center space-x-3">
          <div className="h-11 w-11 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Lock className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-xl font-extrabold text-white">Payment Approval Required</h3>
            <p className="text-xs text-slate-400">
              AgentReady requires your explicit authorization before initiating any financial transaction.
            </p>
          </div>
        </div>

        {/* Side-by-Side: Transaction Summary & Merchant Policy Rule Check */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* Left: Transaction Details */}
          <div className="bg-[#080b12] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
              Transaction Breakdown
            </div>

            <div>
              <div className="text-xs text-slate-500">Selected Product</div>
              <div className="font-bold text-white text-sm">{orderSummary.product_name}</div>
              <div className="text-[10px] text-slate-500 font-mono">Order ID: #{orderSummary.order_id}</div>
            </div>

            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Original Price:</span>
                <span>₹{orderSummary.original_price.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-emerald-400">
                <span>Discount ({orderSummary.discount_percentage}%):</span>
                <span>-₹{orderSummary.discount_amount.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Delivery Estimate:</span>
                <span>{orderSummary.delivery_days} Days</span>
              </div>
              <div className="flex justify-between font-extrabold text-sm text-white pt-2 border-t border-slate-800">
                <span>Final Amount:</span>
                <span className="text-indigo-400 font-mono text-base">₹{orderSummary.final_amount.toLocaleString("en-IN")}</span>
              </div>
            </div>
          </div>

          {/* Right: Policy Authorization Check */}
          <div className="bg-[#080b12] border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
              <span>Merchant Policy Evaluation</span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/30">
                PASSED
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Max Transaction Limit:</span>
                <span className="font-mono text-slate-200">₹25,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Max Allowed Discount:</span>
                <span className="font-mono text-slate-200">10%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Requested Discount:</span>
                <span className="font-mono text-emerald-400 font-bold">{orderSummary.discount_percentage}%</span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                <span className="text-slate-400">Policy Result:</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  COMPLIANT
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-900/60 p-2 rounded-lg border border-slate-800">
              🛡️ Verified by RunPro Sports Policy Engine
            </div>
          </div>

        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold text-sm transition-all"
          >
            Cancel
          </button>

          <button
            onClick={onApprove}
            disabled={isLoading}
            className="flex-1 py-3 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
          >
            {isLoading ? (
              <span>Initiating Razorpay...</span>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                <span>Approve Payment</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
}
