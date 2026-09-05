"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, ShoppingBag, ScrollText, Bot, Zap } from "lucide-react";

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { name: "Buyer Console", path: "/", icon: ShoppingBag },
    { name: "Merchant Policy", path: "/policy", icon: Shield },
    { name: "Audit Log", path: "/audit", icon: ScrollText },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-slate-950/80 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Subtitle */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 flex items-center justify-center shadow-lg shadow-blue-500/20">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-xl tracking-tight text-white">Agent<span className="text-cyan-400">Ready</span></span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50 font-medium">
                  Razorpay AI Buildathon
                </span>
              </div>
              <p className="text-xs text-slate-400">Policy-Controlled Commerce Platform</p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex space-x-1 sm:space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.path;
              return (
                <Link
                  key={item.path}
                  href={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? "bg-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-inner"
                      : "text-slate-400 hover:text-white hover:bg-slate-900"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* Merchant & Demo Mode Status */}
          <div className="hidden md:flex items-center space-x-3">
            <div className="text-right">
              <div className="text-xs text-slate-400">Active Merchant</div>
              <div className="text-sm font-semibold text-white">RunPro Sports</div>
            </div>
            <div className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              <Zap className="h-3.5 w-3.5" />
              <span>DEMO MODE</span>
            </div>
          </div>

        </div>
      </div>
    </header>
  );
}
