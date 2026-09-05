"use client";

import { useState } from "react";
import {
  X,
  Lock,
  CreditCard,
  Smartphone,
  Landmark,
  ShieldCheck,
  Loader2,
  XCircle,
} from "lucide-react";

interface RazorpayCheckoutModalProps {
  isOpen: boolean;
  orderId: string;
  amount: number;
  productName?: string;
  isProcessing: boolean;
  onPayNow: () => void;
  onSimulateFailure: () => void;
  onClose: () => void;
}

type PaymentMethod = "card" | "upi" | "netbanking";

export default function RazorpayCheckoutModal({
  isOpen,
  orderId,
  amount,
  productName,
  isProcessing,
  onPayNow,
  onSimulateFailure,
  onClose,
}: RazorpayCheckoutModalProps) {
  const [method, setMethod] = useState<PaymentMethod>("card");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-white text-slate-900 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden">
        {/* Razorpay-style header */}
        <div className="bg-[#0a2540] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="h-8 w-8 rounded-lg bg-white/10 flex items-center justify-center font-black text-sm">
              R
            </div>
            <div>
              <div className="text-sm font-bold">Razorpay Test Mode</div>
              <div className="text-[10px] text-white/60 font-mono">{orderId}</div>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isProcessing}
            className="text-white/70 hover:text-white disabled:opacity-40"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Amount */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-500">{productName || "Order Payment"}</div>
            <div className="text-2xl font-black text-slate-900">
              ₹{amount.toLocaleString("en-IN")}
            </div>
          </div>
          <div className="flex items-center space-x-1 text-emerald-600 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4" />
            <span>Secured</span>
          </div>
        </div>

        {/* Method tabs */}
        <div className="flex border-b border-slate-200">
          {[
            { key: "card", label: "Card", icon: CreditCard },
            { key: "upi", label: "UPI", icon: Smartphone },
            { key: "netbanking", label: "NetBanking", icon: Landmark },
          ].map((m) => {
            const Icon = m.icon;
            const active = method === (m.key as PaymentMethod);
            return (
              <button
                key={m.key}
                onClick={() => setMethod(m.key as PaymentMethod)}
                disabled={isProcessing}
                className={`flex-1 py-3 text-xs font-semibold flex flex-col items-center space-y-1 transition-colors ${
                  active
                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                    : "text-slate-400 hover:text-slate-600"
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{m.label}</span>
              </button>
            );
          })}
        </div>

        {/* Method body */}
        <div className="p-5 space-y-4">
          {method === "card" && (
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-500 uppercase">
                  Card Number
                </label>
                <div className="mt-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-800 bg-slate-50">
                  4111 •••• •••• 1111
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">
                    Expiry
                  </label>
                  <div className="mt-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-800 bg-slate-50">
                    12/28
                  </div>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 uppercase">
                    CVV
                  </label>
                  <div className="mt-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-800 bg-slate-50">
                    •••
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-slate-400">
                Razorpay Test Card — no real charge will be made.
              </p>
            </div>
          )}

          {method === "upi" && (
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">
                UPI ID
              </label>
              <div className="mt-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-800 bg-slate-50">
                success@razorpay
              </div>
              <p className="text-[11px] text-slate-400">
                Test UPI handle — simulates instant payment success.
              </p>
            </div>
          )}

          {method === "netbanking" && (
            <div className="space-y-3">
              <label className="text-[11px] font-semibold text-slate-500 uppercase">
                Select Bank
              </label>
              <div className="mt-1 border border-slate-300 rounded-lg px-3 py-2.5 text-sm text-slate-800 bg-slate-50">
                HDFC Bank (Test)
              </div>
              <p className="text-[11px] text-slate-400">
                Redirects to a simulated bank test page in Razorpay Test Mode.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 space-y-2">
            <button
              onClick={onPayNow}
              disabled={isProcessing}
              className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 text-white font-bold text-sm shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing Transaction...</span>
                </>
              ) : (
                <>
                  <Lock className="h-4 w-4" />
                  <span>Pay Now ₹{amount.toLocaleString("en-IN")}</span>
                </>
              )}
            </button>

            <button
              onClick={onSimulateFailure}
              disabled={isProcessing}
              className="w-full py-2.5 rounded-xl border border-rose-300 text-rose-600 hover:bg-rose-50 disabled:opacity-60 font-semibold text-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <XCircle className="h-3.5 w-3.5" />
              <span>Simulate Payment Failure</span>
            </button>
          </div>
        </div>

        <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-200 text-center text-[10px] text-slate-400 font-mono">
          Powered by Razorpay — Test Mode
        </div>
      </div>
    </div>
  );
}
