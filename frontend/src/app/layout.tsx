import "./globals.css";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { SessionProvider } from "@/context/SessionContext";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "AgentReady — Policy-Controlled Agentic Commerce",
  description: "Razorpay AI Buildathon 2026 — AI Agent Control Center & Fintech Dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#080911] text-slate-100 min-h-screen font-sans antialiased">
        <SessionProvider>
          <Navbar />
          <div className="flex pt-[64px] min-h-screen">
            <Sidebar />
            <main className="flex-1 pl-[240px] min-w-0">
              <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-6">
                {children}
              </div>
            </main>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
