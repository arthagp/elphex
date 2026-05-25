"use client";

import { useElphexStore } from "@/store/elphexStore";
import { Sun, Moon } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function ThemeToggle({ isCollapsed = false }: { isCollapsed?: boolean }) {
  const { theme, toggleTheme } = useElphexStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div 
        className="w-10 h-10 rounded-xl border border-slate-800/40 bg-slate-900/40 animate-pulse"
      />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      className="relative flex items-center justify-center w-10 h-10 rounded-xl border border-slate-800/40 bg-slate-900/40 text-slate-400 hover:text-slate-200 transition-all cursor-pointer shadow-md overflow-hidden shrink-0"
      title={theme === "dark" ? "Mode Terang" : "Mode Gelap"}
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === "dark" ? 0 : 90, 
          scale: theme === "dark" ? 1 : 0,
          opacity: theme === "dark" ? 1 : 0
        }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="absolute flex items-center justify-center"
      >
        <Moon size={18} />
      </motion.div>
      <motion.div
        initial={false}
        animate={{ 
          rotate: theme === "dark" ? -90 : 0, 
          scale: theme === "dark" ? 0 : 1,
          opacity: theme === "dark" ? 0 : 1
        }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="absolute flex items-center justify-center"
      >
        <Sun size={18} className="text-amber-500" />
      </motion.div>
    </button>
  );
}
