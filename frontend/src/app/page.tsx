"use client";

import { useState } from "react";
import Timeline, { TimelineStep } from "@/components/Timeline";
import PaymentApprovalPanel from "@/components/PaymentApprovalPanel";
import PolicyViolationCard from "@/components/PolicyViolationCard";
import OutOfStockCard from "@/components/OutOfStockCard";
import PaymentFailureCard from "@/components/PaymentFailureCard";
import RazorpayCheckoutModal from "@/components/RazorpayCheckoutModal";
import ProductDetailsModal from "@/components/ProductDetailsModal";
import { Star, Package, Truck, Sparkles, RefreshCw, Eye, ArrowRight, CheckCircle2 } from "lucide-react";

const API_BASE = "http://127.0.0.1:8000/api";

export default function BuyerConsole() {
  const [prompt, setPrompt] = useState(
    "I need running shoes under ₹5,000 for daily running and delivery within 3 days."
  );
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [agentResponse, setAgentResponse] = useState<any>(null);
  const [timeline, setTimeline] = useState<TimelineStep[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [orderSummary, setOrderSummary] = useState<any>(null);
  
  // Special Demo Panel States
  const [isPaymentPending, setIsPaymentPending] = useState(false);
  const [isPolicyViolationTriggered, setIsPolicyViolationTriggered] = useState(false);
  const [isOutOfStockTriggered, setIsOutOfStockTriggered] = useState(false);
  const [isPaymentFailureTriggered, setIsPaymentFailureTriggered] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<any>(null);

  // Interactive Razorpay Gateway + Product Details Modal States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isProductDetailsOpen, setIsProductDetailsOpen] = useState(false);

  const runAgent = async (
    customPrompt?: string,
    discountPct: number = 10.0,
    endpoint: string = "/agent/chat"
  ) => {
    setIsLoading(true);
    setPaymentSuccess(null);
    setIsPaymentPending(false);
    setIsPolicyViolationTriggered(false);
    setIsOutOfStockTriggered(false);
    setIsPaymentFailureTriggered(false);
    setIsCheckoutOpen(false);
    setIsProductDetailsOpen(false);
    const activePrompt = customPrompt || prompt;

    try {
      let res;
      if (endpoint === "/agent/test-policy-violation") {
        res = await fetch(`${API_BASE}/agent/test-policy-violation`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ discount_percentage: 20.0 }),
        });
      } else if (endpoint === "/agent/test-out-of-stock") {
        res = await fetch(`${API_BASE}/agent/test-out-of-stock`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      } else {
        res = await fetch(`${API_BASE}/agent/chat`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prompt: activePrompt,
            requested_discount_pct: discountPct,
          }),
        });
      }

      const data = await res.json();
      setAgentResponse(data);
      setSessionId(data.session_id);
      setTimeline(data.timeline || []);
      setSelectedProduct(data.selected_product);
      setOrderSummary(data.order_summary);

      if (data.is_safety_demo || endpoint === "/agent/test-policy-violation") {
        setIsPolicyViolationTriggered(true);
      } else if (data.is_failure_demo || endpoint === "/agent/test-out-of-stock") {
        setIsOutOfStockTriggered(true);
      } else if (data.order_summary) {
        setIsPaymentPending(true);
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprovePayment = async () => {
    if (!orderSummary || !sessionId) return;
    setIsLoading(true);

    try {
      // Step 1: Human Approval Gate
      await fetch(`${API_BASE}/orders/approve-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderSummary.order_id,
          session_id: sessionId,
        }),
      });

      // Step 2: Payment Creation
      const payRes = await fetch(`${API_BASE}/payments/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderSummary.order_id,
          session_id: sessionId,
          human_approved: true,
        }),
      });
      const payData = await payRes.json();

      setTimeline((prev) =>
        prev.map((step) => {
          if (step.title === "Waiting for payment approval") {
            return { ...step, status: "SUCCESS", detail: "Human payment approval granted." };
          }
          if (step.title === "Payment") {
            return {
              ...step,
              status: "SUCCESS",
              detail: `Razorpay Order ${payData.razorpay_order_id} created & authorized (${payData.status}).`,
            };
          }
          return step;
        })
      );

      // Step 3: Backend Verification
      const verifyRes = await fetch(`${API_BASE}/payments/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          payment_id: payData.payment_id,
          razorpay_order_id: payData.razorpay_order_id,
          razorpay_payment_id: payData.razorpay_payment_id || "pay_rzp_demo_123",
          razorpay_signature: "demo_signature",
          session_id: sessionId,
        }),
      });
      const verifyData = await verifyRes.json();

      setTimeline((prev) =>
        prev.map((step) => {
          if (step.title === "Webhook received") {
            return { ...step, status: "SUCCESS", detail: "Webhook event 'payment.captured' received from Razorpay." };
          }
          if (step.title === "Payment verified") {
            return { ...step, status: "SUCCESS", detail: "Backend verified signature. Order state updated to CONFIRMED." };
          }
          return step;
        })
      );

      setPaymentSuccess(verifyData);
      setIsPaymentPending(false);
      setIsCheckoutOpen(false);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulatePaymentFailure = async () => {
    if (!orderSummary || !sessionId) return;
    setIsLoading(true);

    try {
      await fetch(`${API_BASE}/payments/simulate-failure`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: orderSummary.order_id,
          session_id: sessionId,
          human_approved: true,
        }),
      });

      setTimeline((prev) =>
        prev.map((step) => {
          if (step.title === "Payment") {
            return { ...step, status: "FAILED", detail: "Payment declined by issuing bank (Simulated Failure)." };
          }
          if (step.title === "Payment verified") {
            return { ...step, status: "FAILED", detail: "Order status remains FAILED. Duplicate payments blocked." };
          }
          return step;
        })
      );

      setIsPaymentPending(false);
      setIsCheckoutOpen(false);
      setIsPaymentFailureTriggered(true);
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">AI Buyer Console</h1>
        <p className="text-xs text-slate-400 mt-1">
          An autonomous commerce agent operating within merchant-defined policies.
        </p>
      </div>

      {/* Command / Input Area (Large Command Center) */}
      <div className="bg-[#0e121e] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-xs font-bold text-indigo-400 font-mono uppercase tracking-wider">
          <Sparkles className="h-4 w-4" />
          <span>What can I find for you?</span>
        </div>

        <textarea
          rows={3}
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="I need running shoes under ₹5,000 for daily running and delivery within 3 days."
          className="w-full bg-[#080a10] border border-slate-800 rounded-xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors font-sans resize-none"
        />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-1">
          
          {/* Modern Preset Scenario Pill Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-mono text-slate-500 font-semibold mr-1">Presets:</span>
            
            <button
              onClick={() => runAgent("I need running shoes under ₹5,000 for daily running and delivery within 3 days.", 10.0)}
              className="bg-slate-900 hover:bg-slate-800 border border-slate-700/80 text-xs text-slate-200 px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer"
            >
              Main Purchase
            </button>

            <button
              onClick={() => runAgent("", 20.0, "/agent/test-policy-violation")}
              className="bg-rose-950/30 hover:bg-rose-900/50 border border-rose-700/50 text-xs text-rose-300 px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer"
            >
              Policy Violation
            </button>

            <button
              onClick={() => runAgent("", 10.0, "/agent/test-out-of-stock")}
              className="bg-purple-950/30 hover:bg-purple-900/50 border border-purple-700/50 text-xs text-purple-300 px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer"
            >
              Out-of-Stock Recovery
            </button>

            <button
              onClick={async () => {
                await runAgent("I need running shoes under ₹5,000", 10.0);
                setIsPaymentFailureTriggered(true);
              }}
              className="bg-amber-950/30 hover:bg-amber-900/50 border border-amber-700/50 text-xs text-amber-300 px-3 py-1.5 rounded-full font-medium transition-all cursor-pointer"
            >
              Payment Failure
            </button>
          </div>

          {/* Primary CTA */}
          <button
            onClick={() => runAgent()}
            disabled={isLoading}
            className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold px-7 py-3 rounded-xl flex items-center justify-center space-x-2 text-sm shadow-xl shadow-indigo-600/30 transition-all shrink-0 cursor-pointer"
          >
            {isLoading ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              <>
                <span className="text-lg">✦</span>
                <span>Run Agent</span>
              </>
            )}
          </button>

        </div>
      </div>

      {/* Special Demo Panels (Rendered prominently when triggered) */}

      {/* 1. Payment Approval Panel */}
      {isPaymentPending && orderSummary && (
        <PaymentApprovalPanel
          orderSummary={orderSummary}
          onApprove={() => setIsCheckoutOpen(true)}
          onCancel={handleSimulatePaymentFailure}
          isLoading={isLoading}
        />
      )}

      {/* Interactive Razorpay Test Mode Gateway Popup */}
      {orderSummary && (
        <RazorpayCheckoutModal
          isOpen={isCheckoutOpen}
          orderId={orderSummary.order_id}
          amount={orderSummary.final_amount}
          productName={orderSummary.product_name}
          isProcessing={isLoading}
          onPayNow={handleApprovePayment}
          onSimulateFailure={handleSimulatePaymentFailure}
          onClose={() => setIsCheckoutOpen(false)}
        />
      )}

      {/* Product Specifications & Rationale Modal */}
      <ProductDetailsModal
        isOpen={isProductDetailsOpen}
        product={selectedProduct}
        onClose={() => setIsProductDetailsOpen(false)}
        onProceed={() => {
          setIsProductDetailsOpen(false);
          if (orderSummary) setIsPaymentPending(true);
        }}
      />

      {/* 2. Policy Violation Panel */}
      {isPolicyViolationTriggered && (
        <PolicyViolationCard
          onUseMaxAllowed={() => {
            setIsPolicyViolationTriggered(false);
            if (orderSummary) setIsPaymentPending(true);
          }}
        />
      )}

      {/* 3. Out of Stock Recovery Panel */}
      {isOutOfStockTriggered && selectedProduct && (
        <OutOfStockCard
          outOfStockProduct="Nike Pegasus 40"
          replacementProduct={selectedProduct}
          onContinue={() => {
            setIsOutOfStockTriggered(false);
            if (orderSummary) setIsPaymentPending(true);
          }}
        />
      )}

      {/* 4. Payment Failure Panel */}
      {isPaymentFailureTriggered && (
        <PaymentFailureCard
          onRetry={() => {
            setIsPaymentFailureTriggered(false);
            if (orderSummary) setIsPaymentPending(true);
          }}
          onCancel={() => {
            setIsPaymentFailureTriggered(false);
          }}
        />
      )}

      {/* Success Notification */}
      {paymentSuccess && (
        <div className="bg-emerald-950/40 border-2 border-emerald-500/50 rounded-2xl p-5 text-emerald-300 flex items-center space-x-3 text-sm shadow-xl">
          <CheckCircle2 className="h-7 w-7 text-emerald-400 shrink-0" />
          <div>
            <div className="font-extrabold text-base text-emerald-200">Payment Verified & Order Confirmed!</div>
            <div className="text-xs text-emerald-400 font-mono mt-0.5">
              Razorpay Order ID: {paymentSuccess.razorpay_order_id || "order_rzp_demo"} &bull; Order Status: CONFIRMED
            </div>
          </div>
        </div>
      )}

      {/* Main Content Grid: 65% / 35% Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Agent Activity (approx 65% / col-span-7) */}
        <div className="lg:col-span-7">
          <Timeline steps={timeline} />
        </div>

        {/* RIGHT COLUMN: Recommended Product (approx 35% / col-span-5) */}
        <div className="lg:col-span-5">
          <div className="bg-[#0e121e] border border-slate-800/80 rounded-2xl p-5 shadow-xl space-y-4 sticky top-[80px]">
            
            {/* Header with AI MATCH % */}
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="text-xs font-extrabold uppercase tracking-wider font-mono text-indigo-400">
                AI RECOMMENDATION
              </div>
              {selectedProduct && (
                <div className="flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-indigo-500/15 text-indigo-300 border border-indigo-500/40 font-mono">
                  <span>AI MATCH</span>
                  <span className="text-white font-black">94%</span>
                </div>
              )}
            </div>

            {selectedProduct ? (
              <div className="space-y-4">
                
                {/* Product Main Details */}
                <div className="bg-[#080a10] border-2 border-indigo-500/50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-black text-lg text-white">{selectedProduct.name}</h4>
                      <span className="text-xs text-slate-400">{selectedProduct.category}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-xl font-black font-mono text-indigo-400">
                        ₹{selectedProduct.price.toLocaleString("en-IN")}
                      </div>
                      <div className="flex items-center text-xs text-amber-400 justify-end space-x-1 font-bold mt-0.5">
                        <Star className="h-3.5 w-3.5 fill-amber-400" />
                        <span>{selectedProduct.rating}</span>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed">{selectedProduct.description}</p>

                  <div className="grid grid-cols-2 gap-2 pt-2 text-xs border-t border-slate-800 text-slate-400 font-mono">
                    <div className="flex items-center space-x-1.5">
                      <Package className="h-3.5 w-3.5 text-indigo-400" />
                      <span><strong className="text-slate-200">{selectedProduct.stock}</strong> in stock</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Truck className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Delivery: <strong className="text-slate-200">{selectedProduct.delivery_days} days</strong></span>
                    </div>
                  </div>
                </div>

                {/* "Why this product?" Section */}
                <div className="bg-[#080a10] border border-slate-800/80 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
                  <span className="font-bold text-indigo-400 block font-mono uppercase text-[11px]">
                    Why this product?
                  </span>
                  <p className="leading-relaxed text-slate-300">
                    &ldquo;Best match for your daily-running requirement while staying within your ₹5,000 budget.&rdquo;
                  </p>
                </div>

                {/* Card Action Buttons */}
                <div className="flex space-x-2 pt-1">
                  <button
                    onClick={() => setIsProductDetailsOpen(true)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-slate-800 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    <span>View Details</span>
                  </button>

                  <button
                    onClick={() => {
                      if (orderSummary) setIsPaymentPending(true);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center space-x-1 cursor-pointer"
                  >
                    <span>Continue</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </button>
                </div>

              </div>
            ) : (
              <div className="text-center py-16 text-slate-500 text-xs font-mono">
                No product recommended yet. Run an agent prompt to view evaluation results.
              </div>
            )}

          </div>
        </div>

      </div>

    </div>
  );
}
