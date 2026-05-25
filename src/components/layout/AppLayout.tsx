"use client";

import { useEffect } from "react";
import { useElphexStore } from "@/store/elphexStore";
import Sidebar from "./Sidebar";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, X } from "lucide-react";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const { 
    isLoading, 
    user,
    pet,
    fetchInitialData, 
    pomodoro, 
    tickPomodoro,
    xpNotification,
    hideXpNotification
  } = useElphexStore();

  const showLoading = isLoading || !user || !pet;

  // 1. Fetch initial application data on mount
  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // 2. Global Pomodoro Timer Tick Interval
  useEffect(() => {
    let intervalId: NodeJS.Timeout | null = null;
    if (pomodoro.isRunning) {
      intervalId = setInterval(() => {
        tickPomodoro();
      }, 1000);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [pomodoro.isRunning, tickPomodoro]);

  // 3. Auto-dismiss XP notifications after 3 seconds
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | null = null;
    if (xpNotification.show) {
      timeoutId = setTimeout(() => {
        hideXpNotification();
      }, 3000);
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [xpNotification.show, hideXpNotification]);

  // 4. Sync theme preferences from localStorage on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedTheme = localStorage.getItem("elphex-theme") as "light" | "dark" | null;
      if (savedTheme === "light" || savedTheme === "dark") {
        useElphexStore.setState({ theme: savedTheme });
        if (savedTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      } else {
        document.documentElement.classList.add("dark");
      }
    }
  }, []);

  return (
    <div className="min-h-screen flex text-foreground bg-background relative overflow-hidden font-sans">
      {/* Background radial gradient blobs */}
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-0">
        <div className="absolute top-[10%] left-[5%] w-[400px] h-[400px] rounded-full bg-blue-600/10 blur-[120px]"></div>
        <div className="absolute bottom-[10%] right-[5%] w-[500px] h-[500px] rounded-full bg-purple-600/10 blur-[150px]"></div>
        <div className="absolute top-[40%] right-[30%] w-[300px] h-[300px] rounded-full bg-cyan-600/5 blur-[100px]"></div>
      </div>

      {/* Loading Overlay */}
      <AnimatePresence>
        {showLoading && (
          <motion.div 
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-background z-50 flex flex-col items-center justify-center"
          >
            <div className="relative flex flex-col items-center">
              <span className="text-7xl animate-bounce block select-none">🐘</span>
              <div className="w-12 h-12 rounded-full border-4 border-blue-500/20 border-t-blue-500 animate-spin mt-6"></div>
              <h3 className="font-extrabold text-xl tracking-wider text-slate-300 mt-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-cyan-400">
                Memuat Elphex OS...
              </h3>
              <p className="text-xs text-slate-500 mt-2 font-medium">Gajah tidak pernah lupa. Bersiaplah bekerja!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Layout Grid */}
      {!showLoading && (
        <>
          <Sidebar />
          <main className="flex-1 min-w-0 h-screen overflow-y-auto px-8 py-8 relative z-10">
            {children}
          </main>
        </>
      )}

      {/* Floating XP / Level Up Notification Popups */}
      <AnimatePresence>
        {xpNotification.show && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: "spring", damping: 15 }}
            className={`fixed bottom-6 right-6 z-50 p-4 rounded-2xl shadow-2xl border flex items-center space-x-3 backdrop-blur-xl ${
              xpNotification.isLevelUp 
                ? "bg-gradient-to-r from-amber-500/30 to-violet-600/30 border-amber-400/50 shadow-amber-500/10" 
                : xpNotification.amount >= 0 
                  ? "bg-slate-900/90 border-[#0085FF]/30 shadow-[#0085FF]/5" 
                  : "bg-slate-900/90 border-orange-500/30 shadow-orange-500/5"
            }`}
          >
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              xpNotification.isLevelUp 
                ? "bg-amber-500 text-slate-950 font-black animate-bounce" 
                : xpNotification.amount >= 0 
                  ? "bg-[#0085FF]/20 text-[#0085FF]" 
                  : "bg-orange-500/20 text-orange-400"
            }`}>
              {xpNotification.isLevelUp ? <Sparkles size={20} /> : <span className="text-sm font-extrabold">{xpNotification.amount >= 0 ? "+" : ""}{xpNotification.amount}</span>}
            </div>

            <div className="min-w-0 pr-4">
              <h5 className={`font-bold text-sm ${xpNotification.isLevelUp ? "text-amber-300" : "text-slate-200"}`}>
                {xpNotification.isLevelUp ? "Level Baru Dicapai! 🎉" : xpNotification.amount >= 0 ? "XP Diperoleh" : "XP Dibelanjakan"}
              </h5>
              <p className="text-xs text-slate-400 font-medium truncate mt-0.5">{xpNotification.message}</p>
            </div>

            <button 
              onClick={hideXpNotification}
              className="text-slate-500 hover:text-slate-300 transition-colors p-1 rounded-lg hover:bg-slate-800 shrink-0 cursor-pointer"
            >
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
