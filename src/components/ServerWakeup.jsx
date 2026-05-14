import { useEffect, useState } from "react";
import { API_BASE } from "../config/api";

export default function ServerWakeup({ onReady }) {
  const [seconds, setSeconds] = useState(0);
  const [statusText, setStatusText] = useState("Establishing connection...");
  const [dotCount, setDotCount] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setSeconds((prev) => prev + 1), 1000);
    const dotTimer = setInterval(() => setDotCount((d) => (d + 1) % 4), 400);

    const statusMessages = [
      "Establishing connection...",
      "Waking up servers...",
      "Loading resources...",
      "Almost there...",
    ];
    const statusTimer = setInterval(() => {
      setStatusText((prev) => {
        const idx = statusMessages.indexOf(prev);
        return statusMessages[(idx + 1) % statusMessages.length];
      });
    }, 4000);

    const checkServer = async () => {
      try {
        const res = await fetch(`${API_BASE}/api/auth/ping`);
        if (res.ok) {
          clearInterval(timer);
          clearInterval(dotTimer);
          clearInterval(statusTimer);
          onReady();
        }
      } catch {
        // Server still sleeping
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 5000);

    return () => {
      clearInterval(interval);
      clearInterval(timer);
      clearInterval(dotTimer);
      clearInterval(statusTimer);
    };
  }, [onReady]);

  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  const progress = Math.min((seconds / 120) * 100, 95);

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#F8F7F3] font-sans relative overflow-hidden">
      {/* Decorative background shapes */}
      <div className="absolute top-[-10%] left-[-5%] w-64 h-64 bg-[#BEF355] rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-pulse"></div>
      <div className="absolute bottom-[-10%] right-[-5%] w-80 h-80 bg-[#121212] rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse" style={{ animationDelay: '2s' }}></div>

      <div className="w-full max-w-md relative z-10 animate-slide-up text-center">
        {/* Logo Mark */}
        <div className="flex justify-center mb-8 animate-pop-in">
          <div className="w-20 h-20 bg-[#BEF355] border-[3px] border-[#1C1C1C] shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rounded-2xl flex items-center justify-center transform -rotate-3 hover:rotate-0 transition-transform cursor-default">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#1C1C1C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
          </div>
        </div>

        <div className="bg-white border-[3px] border-[#1C1C1C] rounded-[24px] shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] p-8 sm:p-10">
          <h1 className="font-heading text-4xl font-black text-[#1C1C1C] mb-2 tracking-tight">EnveChat</h1>
          <p className="text-[#6B7280] font-bold mb-8 min-h-[24px]">
            {statusText}{'.'.repeat(dotCount)}
          </p>

          <div className="bg-[#F8F7F3] border-2 border-[#1C1C1C] rounded-xl p-5 mb-6">
            <div className="flex justify-between items-center mb-6">
              <div className="flex flex-col items-center">
                <span className="text-[#1C1C1C] font-black text-2xl font-mono">
                  {mins}:{String(secs).padStart(2, '0')}
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Elapsed</span>
              </div>
              <div className="w-[2px] h-10 bg-[#1C1C1C] opacity-20 border-dashed"></div>
              <div className="flex flex-col items-center">
                <span className="text-[#1C1C1C] font-black text-2xl font-mono">
                  ~2:00
                </span>
                <span className="text-[10px] font-black uppercase tracking-widest text-[#6B7280]">Estimated</span>
              </div>
            </div>

            <div className="h-4 bg-white border-2 border-[#1C1C1C] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#BEF355] border-r-2 border-[#1C1C1C] transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Info pill */}
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#1C1C1C] rounded-lg text-xs font-bold text-[#1C1C1C] shadow-[2px_2px_0px_0px_#1C1C1C] mb-6 text-left">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="shrink-0 text-[#BEF355]">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            <span>Free-tier server cold start — happens after inactivity.</span>
          </div>

          {/* Loading dots */}
          <div className="flex justify-center gap-2">
            {[0, 1, 2].map((i) => (
              <span 
                key={i} 
                className="w-3 h-3 rounded-full border-2 border-[#1C1C1C] bg-[#BEF355] inline-block animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }} 
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}