"use client";

import { useEffect, useState } from "react";
import { Shield, Check, X, Save, RefreshCw, Lock, DollarSign, Percent, Eye } from "lucide-react";
import { useSession } from "@/context/SessionContext";

const API_BASE = "http://127.0.0.1:8000/api";

export default function MerchantPolicyDashboard() {
  const { currentUser } = useSession();
  const isAdmin = currentUser.role === "admin";
  const [policy, setPolicy] = useState<any>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    fetchPolicy();
  }, []);

  const fetchPolicy = async () => {
    try {
      const res = await fetch(`${API_BASE}/merchant/policy`);
      const data = await res.json();
      setPolicy(data);
    } catch (err) {
      console.error("Failed to fetch merchant policy", err);
    }
  };

  const handleSavePolicy = async () => {
    if (!policy || !isAdmin) return;
    setIsSaving(true);
    setSaveSuccess(false);
    try {
      const res = await fetch(`${API_BASE}/merchant/policy`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(policy),
      });
      const updated = await res.json();
      setPolicy(updated);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to update policy", err);
    } finally {
      setIsSaving(false);
    }
  };

  if (!policy) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400 text-xs font-mono">
        <RefreshCw className="h-4 w-4 animate-spin mr-2" />
        <span>Loading Merchant Policy...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-[1200px] mx-auto">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-extrabold text-white">Merchant Policy</h1>
            <span className="text-slate-500 font-bold">&bull;</span>
            <span className="text-indigo-400 font-bold text-lg">RunPro Sports</span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Deterministic business rules governing AI buyer agent tool calls
          </p>
        </div>

        {isAdmin ? (
          <button
            onClick={handleSavePolicy}
            disabled={isSaving}
            className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>{isSaving ? "Saving..." : "Save Policy Rules"}</span>
          </button>
        ) : (
          <div className="flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 text-xs font-bold">
            <Eye className="h-3.5 w-3.5" />
            <span>View Only</span>
          </div>
        )}
      </div>

      {saveSuccess && (
        <div className="bg-emerald-950/40 border border-emerald-500/50 rounded-xl p-3 text-emerald-300 text-xs flex items-center space-x-2">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>Merchant policy rules updated successfully!</span>
        </div>
      )}

      {!isAdmin && (
        <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-slate-300 text-xs flex items-center space-x-2.5">
          <Eye className="h-4 w-4 text-slate-400 shrink-0" />
          <span>
            You&apos;re viewing this as <strong className="text-white">Demo Buyer</strong> — read-only.
            Switch to <strong className="text-indigo-300">Merchant Administrator</strong> from the user
            badge in the navbar to edit these rules.
          </span>
        </div>
      )}

      {/* Dashboard Rule Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Transaction Limit */}
        <div className="bg-[#0e121e] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Transaction Limit
            </span>
            <DollarSign className="h-4 w-4 text-indigo-400" />
          </div>

          <div className="space-y-1">
            <input
              type="number"
              value={policy.max_transaction_amount}
              onChange={(e) => setPolicy({ ...policy, max_transaction_amount: parseFloat(e.target.value) || 0 })}
              disabled={!isAdmin}
              className="w-full bg-[#080a10] border border-slate-800 rounded-xl px-3 py-2 text-xl font-black text-indigo-400 font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-500 font-mono">Maximum transaction amount permitted</p>
          </div>
        </div>

        {/* Maximum Discount */}
        <div className="bg-[#0e121e] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Maximum Discount
            </span>
            <Percent className="h-4 w-4 text-emerald-400" />
          </div>

          <div className="space-y-1">
            <input
              type="number"
              value={policy.max_discount_percentage}
              onChange={(e) => setPolicy({ ...policy, max_discount_percentage: parseFloat(e.target.value) || 0 })}
              disabled={!isAdmin}
              className="w-full bg-[#080a10] border border-slate-800 rounded-xl px-3 py-2 text-xl font-black text-emerald-400 font-mono focus:outline-none focus:border-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            <p className="text-[11px] text-slate-500 font-mono">Maximum discount percentage cap</p>
          </div>
        </div>

        {/* Payment Approval */}
        <div className="bg-[#0e121e] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Payment Approval
            </span>
            <Lock className="h-4 w-4 text-amber-400" />
          </div>

          <div className="flex items-center justify-between bg-[#080a10] p-3 rounded-xl border border-slate-800">
            <span className="text-sm font-bold text-white">Required</span>
            <input
              type="checkbox"
              checked={policy.require_payment_approval}
              onChange={(e) => setPolicy({ ...policy, require_payment_approval: e.target.checked })}
              disabled={!isAdmin}
              className="h-4 w-4 accent-indigo-600 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
          <p className="text-[11px] text-slate-500 font-mono">Human approval required for financial actions</p>
        </div>

      </div>

      {/* ALLOWED vs RESTRICTED ACTIONS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* ALLOWED ACTIONS */}
        <div className="bg-[#0e121e] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-emerald-400 border-b border-slate-800/80 pb-3 font-mono">
            ALLOWED ACTIONS
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between bg-[#080a10] p-3 rounded-xl border border-slate-800">
              <span className="text-slate-200 flex items-center space-x-2">
                <Check className="h-4 w-4 text-emerald-400 font-bold" />
                <span>Create Cart</span>
              </span>
              <input
                type="checkbox"
                checked={policy.allow_create_cart}
                onChange={(e) => setPolicy({ ...policy, allow_create_cart: e.target.checked })}
                disabled={!isAdmin}
                className="h-4 w-4 accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex items-center justify-between bg-[#080a10] p-3 rounded-xl border border-slate-800">
              <span className="text-slate-200 flex items-center space-x-2">
                <Check className="h-4 w-4 text-emerald-400 font-bold" />
                <span>Apply Discount</span>
              </span>
              <input
                type="checkbox"
                checked={policy.allow_apply_discount}
                onChange={(e) => setPolicy({ ...policy, allow_apply_discount: e.target.checked })}
                disabled={!isAdmin}
                className="h-4 w-4 accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex items-center justify-between bg-[#080a10] p-3 rounded-xl border border-slate-800">
              <span className="text-slate-200 flex items-center space-x-2">
                <Check className="h-4 w-4 text-emerald-400 font-bold" />
                <span>Reserve Inventory</span>
              </span>
              <input
                type="checkbox"
                checked={policy.allow_reserve_inventory}
                onChange={(e) => setPolicy({ ...policy, allow_reserve_inventory: e.target.checked })}
                disabled={!isAdmin}
                className="h-4 w-4 accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

        {/* RESTRICTED ACTIONS */}
        <div className="bg-[#0e121e] border border-slate-800/80 rounded-2xl p-5 shadow-lg space-y-3">
          <div className="text-xs font-black uppercase tracking-wider text-rose-400 border-b border-slate-800/80 pb-3 font-mono">
            RESTRICTED ACTIONS
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            <div className="flex items-center justify-between bg-[#080a10] p-3 rounded-xl border border-slate-800">
              <span className="text-slate-200 flex items-center space-x-2">
                <X className="h-4 w-4 text-rose-400 font-bold" />
                <span>Refund</span>
              </span>
              <input
                type="checkbox"
                checked={policy.allow_refund}
                onChange={(e) => setPolicy({ ...policy, allow_refund: e.target.checked })}
                disabled={!isAdmin}
                className="h-4 w-4 accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="flex items-center justify-between bg-[#080a10] p-3 rounded-xl border border-slate-800">
              <span className="text-slate-200 flex items-center space-x-2">
                <X className="h-4 w-4 text-rose-400 font-bold" />
                <span>Change Shipping</span>
              </span>
              <input
                type="checkbox"
                checked={policy.allow_shipping_change}
                onChange={(e) => setPolicy({ ...policy, allow_shipping_change: e.target.checked })}
                disabled={!isAdmin}
                className="h-4 w-4 accent-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>
          </div>
        </div>

      </div>

      {/* Highlighted Explanation Callout Box at Bottom */}
      <div className="bg-[#0e121e] border-2 border-indigo-500/50 rounded-2xl p-6 shadow-xl text-center space-y-1">
        <h2 className="text-lg font-black text-white italic tracking-tight">
          &ldquo;AI proposes actions. The Policy Engine determines what is allowed.&rdquo;
        </h2>
        <p className="text-xs text-slate-400 font-mono">
          Deterministic business rules run in Python before database mutation or transaction initiation.
        </p>
      </div>

    </div>
  );
}
