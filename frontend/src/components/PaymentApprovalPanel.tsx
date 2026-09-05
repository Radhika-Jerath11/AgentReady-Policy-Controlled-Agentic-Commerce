"use client";

import { ShieldCheck, CheckCircle2, Lock, ArrowRight, X } from "lucide-react";

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

interface PaymentApprovalPanelProps {
  orderSummary: PaymentOrderSummary;
  onApprove: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export default function PaymentApprovalPanel({
  orderSummary,
  onApprove,
  onCancel,
  isLoading,
}: PaymentApprovalPanelProps) {
  return (
    <div className="bg-[#0e121e] border-2 border-indigo-500/60 rounded-2xl p-6 shadow-2xl space-y-5 animate-fade-in">
      
      {/* Title & Subtitle */}
      <div className="flex items-center space-x-3">
        <div className="h-11 w-11 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-400 shrink-0">
          <Lock className="h-5 w-5" />
        </div>
        <div>
          <h3 className="text-xl font-extrabold text-white">Payment Approval Required</h3>
          <p className="text-xs text-slate-400">
            AgentReady requires your authorization before moving money.
          </p>
        </div>
      </div>

      {/* Grid: Transaction Details & Merchant Policy Check */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Transaction Summary */}
        <div className="bg-[#080a10] border border-slate-800 rounded-xl p-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2">
            Transaction Details
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-500">Product</div>
            <div className="font-bold text-white text-sm">{orderSummary.product_name}</div>
          </div>

          <div className="space-y-1.5 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Original Price:</span>
              <span>₹{orderSummary.original_price.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-emerald-400">
              <span>Merchant Discount ({orderSummary.discount_percentage}%):</span>
              <span>-₹{orderSummary.discount_amount.toLocaleString("en-IN")}</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Delivery Estimate:</span>
              <span>{orderSummary.delivery_days} Days</span>
            </div>
            <div className="flex justify-between font-black text-sm text-white pt-2 border-t border-slate-800">
              <span>Final Amount:</span>
              <span className="text-indigo-400 font-mono text-base">₹{orderSummary.final_amount.toLocaleString("en-IN")}</span>
            </div>
          </div>
        </div>

        {/* Merchant Policy Verification */}
        <div className="bg-[#080a10] border border-slate-800 rounded-xl p-4 space-y-2.5">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-800 pb-2 flex items-center justify-between">
            <span>MERCHANT POLICY</span>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono border border-emerald-500/30">
              VERIFIED
            </span>
          </div>

          <div className="space-y-2 text-xs font-mono">
            <div className="flex justify-between text-slate-400">
              <span>Maximum transaction:</span>
              <span className="text-slate-200">₹25,000</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Maximum discount:</span>
              <span className="text-slate-200">10%</span>
            </div>
            <div className="flex justify-between text-slate-400">
              <span>Agent requested:</span>
              <span className="text-emerald-400 font-bold">{orderSummary.discount_percentage}%</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-slate-800">
              <span className="text-slate-400">Policy result:</span>
              <span className="flex items-center space-x-1 text-emerald-400 font-bold">
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>ALLOWED</span>
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Action Buttons */}
      <div className="flex items-center space-x-3 pt-2">
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="py-3 px-5 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all cursor-pointer"
        >
          Cancel
        </button>

        <button
          onClick={onApprove}
          disabled={isLoading}
          className="flex-1 py-3 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-black text-sm shadow-xl shadow-indigo-600/30 flex items-center justify-center space-x-2 transition-all cursor-pointer"
        >
          {isLoading ? (
            <span>Initiating Razorpay...</span>
          ) : (
            <>
              <span>Approve Payment</span>
              <ArrowRight className="h-4 w-4" />
            </>
          )}
        </button>
      </div>

    </div>
  );
}
