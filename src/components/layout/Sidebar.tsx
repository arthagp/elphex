"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useElphexStore } from "@/store/elphexStore";
import { getXpForCurrentLevelProgress, getLevelTitle } from "@/lib/gameEngine";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Zap, 
  Timer, 
  ShoppingBag, 
  Trophy, 
  ChevronLeft, 
  ChevronRight,
  Flame,
  Utensils,
  Sparkles
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showFeedOptions, setShowFeedOptions] = useState(false);

  const { user, pet, feedPet, playWithPet } = useElphexStore();

  if (!user || !pet) return null;

  const xpProgress = getXpForCurrentLevelProgress(user.totalXp);
  const title = getLevelTitle(user.level);

  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Tugas", href: "/tasks", icon: CheckSquare },
    { name: "Herd Mode Sprints", href: "/sprints", icon: Zap },
    { name: "Pomodoro Fokus", href: "/focus", icon: Timer },
    { name: "Toko Hadiah", href: "/store", icon: ShoppingBag },
    { name: "Peringkat", href: "/leaderboard", icon: Trophy },
  ];

  // Map pet color state to CSS classes
  const getPetColorClass = (color: string) => {
    switch (color) {
      case "BLUE":
        return "text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]";
      case "GOLD":
        return "text-yellow-400 drop-shadow-[0_0_10px_rgba(234,179,8,0.9)]";
      case "COSMIC":
        return "text-purple-400 drop-shadow-[0_0_12px_rgba(168,85,247,1)]";
      default:
        return "text-slate-400 drop-shadow-[0_0_4px_rgba(148,163,184,0.5)]";
    }
  };

  const getPetMoodEmoji = (mood: string) => {
    switch (mood) {
      case "EXCITED": return "🤩";
      case "SLEEPY": return "😴";
      case "FOCUSED": return "🧐";
      case "HUNGRY": return "😋";
      default: return "😊";
    }
  };

  const getPetMoodLabel = (mood: string) => {
    switch (mood) {
      case "EXCITED": return "Sangat Bersemangat!";
      case "SLEEPY": return "Mengantuk...";
      case "FOCUSED": return "Fokus Bekerja";
      case "HUNGRY": return "Lapar!";
      default: return "Senang";
    }
  };

  return (
    <div 
      className={`glass-panel border-r border-slate-800/40 min-h-screen flex flex-col transition-all duration-300 relative z-30 ${
        isCollapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Collapse toggle button */}
      <button 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute top-6 -right-3 w-6 h-6 rounded-full bg-[#0085FF] border border-blue-400 flex items-center justify-center text-white hover:bg-blue-600 transition-colors shadow-lg cursor-pointer"
      >
        {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </button>

      {/* Brand Header */}
      <div className={`p-6 flex items-center justify-between ${isCollapsed ? "flex-col space-y-4" : ""}`}>
        <div className={`flex items-center ${isCollapsed ? "justify-center" : "space-x-3"}`}>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#0085FF] to-violet-600 flex items-center justify-center shadow-lg shadow-blue-500/20 shrink-0">
            <span className="text-xl">🐘</span>
          </div>
          {!isCollapsed && (
            <div>
              <h1 className="font-extrabold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#0085FF] to-cyan-400">
                ELPHEX
              </h1>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest -mt-0.5">
                Elephant Brain OS
              </p>
            </div>
          )}
        </div>
        <ThemeToggle isCollapsed={isCollapsed} />
      </div>

      {/* User Stats Card */}
      <div className={`px-4 mb-4 ${isCollapsed ? "flex justify-center" : ""}`}>
        {isCollapsed ? (
          <div className="w-10 h-10 rounded-full border border-blue-500/30 flex items-center justify-center bg-blue-950/20 text-blue-400 font-bold">
            L{user.level}
          </div>
        ) : (
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/30 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-violet-500/10 rounded-full blur-xl -mr-6 -mt-6"></div>
            
            {/* User Meta */}
            <div className="flex items-center space-x-3 mb-3 relative z-10">
              <img 
                src={user.avatarUrl || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.name}`}
                alt={user.name}
                className="w-10 h-10 rounded-full border border-slate-700 bg-slate-800"
              />
              <div className="min-w-0 flex-1">
                <h4 className="font-semibold text-slate-200 truncate text-sm">{user.name}</h4>
                <p className="text-[11px] text-[#0085FF] font-medium truncate">{title}</p>
              </div>
              <div className="flex items-center space-x-1 px-2 py-0.5 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 shrink-0">
                <Flame size={12} className="fill-orange-400 animate-pulse" />
                <span className="text-[10px] font-bold">{user.currentStreak}d</span>
              </div>
            </div>

            {/* Level / XP Progress bar */}
            <div className="relative z-10">
              <div className="flex justify-between text-[11px] text-slate-400 font-medium mb-1">
                <span>Level {user.level}</span>
                <span>{user.totalXp} XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-950 overflow-hidden border border-slate-800/50">
                <div 
                  className="h-full bg-gradient-to-r from-[#0085FF] via-cyan-400 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${xpProgress.percent}%` }}
                ></div>
              </div>
              <div className="flex justify-between text-[9px] text-slate-500 font-medium mt-0.5">
                <span>Progress: {Math.round(xpProgress.percent)}%</span>
                <span>{xpProgress.max - xpProgress.current} XP to Lvl {user.level + 1}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="px-3 space-y-1 flex-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                isActive 
                  ? "bg-[#0085FF]/10 text-[#0085FF] border border-[#0085FF]/20 shadow-inner" 
                  : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/30 border border-transparent"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
              title={isCollapsed ? item.name : undefined}
            >
              <Icon size={18} className={isActive ? "text-[#0085FF]" : ""} />
              {!isCollapsed && <span>{item.name}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Elph Pet Widget */}
      <div className={`p-4 border-t border-slate-800/40 bg-slate-950/20 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
        {isCollapsed ? (
          <div className="cursor-pointer" title="Pet Elphy" onClick={() => playWithPet()}>
            <span className="text-2xl animate-float block">🐘</span>
          </div>
        ) : (
          <div className="p-3 rounded-2xl bg-slate-900/40 border border-slate-800/30 flex flex-col items-center relative overflow-hidden">
            {/* Pet glow background */}
            <div className="absolute -bottom-10 w-24 h-24 bg-cyan-500/10 rounded-full blur-xl"></div>
            
            {/* Animated Pet Display */}
            <div className="relative mb-2">
              <span className={`text-4xl animate-float block cursor-pointer select-none ${getPetColorClass(pet.color)}`} onClick={() => playWithPet()}>
                🐘
              </span>
              <span className="absolute -bottom-1 -right-2 text-sm bg-slate-950/80 px-1 py-0.5 rounded border border-slate-800 leading-none">
                {getPetMoodEmoji(pet.mood)}
              </span>
            </div>

            {/* Pet metadata */}
            <div className="text-center w-full min-w-0">
              <h5 className="font-bold text-slate-300 text-xs truncate">{pet.name}</h5>
              <div className="flex items-center justify-center space-x-1 mt-0.5">
                <span className="text-[9px] bg-cyan-950 text-cyan-400 px-1.5 py-0.5 rounded font-bold border border-cyan-500/20">
                  Pet Lvl {pet.level}
                </span>
                <span className="text-[9px] text-slate-500 truncate">
                  Mood: {getPetMoodLabel(pet.mood)}
                </span>
              </div>
            </div>

            {/* Interaction Buttons */}
            <div className="grid grid-cols-2 gap-2 mt-3 w-full">
              <button 
                onClick={() => playWithPet()}
                className="flex items-center justify-center space-x-1 py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-[#0085FF] hover:border-[#0085FF]/30 transition-all text-[11px] font-semibold cursor-pointer"
              >
                <Sparkles size={12} />
                <span>Bermain</span>
              </button>
              <div className="relative">
                <button 
                  onClick={() => setShowFeedOptions(!showFeedOptions)}
                  className="flex items-center justify-center space-x-1 w-full py-1.5 rounded-xl border border-slate-800 bg-slate-900/60 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/30 transition-all text-[11px] font-semibold cursor-pointer"
                >
                  <Utensils size={12} />
                  <span>Beri Makan</span>
                </button>

                {/* Feed Menu Dropdown */}
                <AnimatePresence>
                  {showFeedOptions && (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute bottom-full left-0 right-0 mb-1 glass-panel border border-slate-800/80 rounded-xl p-1 z-40 space-y-0.5"
                    >
                      {[
                        { type: "Kacang", label: "🥜 Kacang (+15 XP)" },
                        { type: "Rumput", label: "🌿 Rumput (+15 XP)" },
                        { type: "Semangka", label: "🍉 Semangka (+15 XP)" }
                      ].map((food) => (
                        <button
                          key={food.type}
                          onClick={() => {
                            feedPet(food.type);
                            setShowFeedOptions(false);
                          }}
                          className="w-full text-left px-2 py-1 hover:bg-slate-800 rounded-lg text-[10px] text-slate-300 font-medium transition-colors cursor-pointer"
                        >
                          {food.label}
                        </button>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
