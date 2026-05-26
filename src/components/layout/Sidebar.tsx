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
  Sparkles,
  LogOut,
  Plus,
  Lock,
  ChevronDown
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [showFeedOptions, setShowFeedOptions] = useState(false);
  const [showWorkspaceModal, setShowWorkspaceModal] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");
  const [errorWorkspace, setErrorWorkspace] = useState("");
  const [isSubmittingWorkspace, setIsSubmittingWorkspace] = useState(false);

  const { 
    user, 
    pet, 
    feedPet, 
    playWithPet, 
    workspaces, 
    activeWorkspaceId, 
    setActiveWorkspaceId,
    logout,
    addWorkspace
  } = useElphexStore();

  const router = useRouter();

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

  const filteredNavItems = navItems.filter((item) => {
    if (item.href === "/sprints" && activeWorkspaceId?.includes("personal")) {
      return false;
    }
    return true;
  });

  const handleNewWorkspaceClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowWorkspaceModal(true);
  };

  const handleCreateWorkspace = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) {
      setErrorWorkspace("Nama organisasi wajib diisi.");
      return;
    }
    setIsSubmittingWorkspace(true);
    setErrorWorkspace("");
    try {
      await addWorkspace(newWorkspaceName);
      setNewWorkspaceName("");
      setShowWorkspaceModal(false);
    } catch (err: any) {
      setErrorWorkspace(err?.message || "Gagal membuat organisasi.");
    } finally {
      setIsSubmittingWorkspace(false);
    }
  };

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
              <div className="flex items-center space-x-1.5">
                <h1 className="font-extrabold text-xl tracking-wider bg-clip-text text-transparent bg-gradient-to-r from-[#0085FF] to-cyan-400">
                  ELPHEX
                </h1>
                <Link
                  href="/payment"
                  className={`text-[8px] px-1.5 py-0.5 rounded-md font-extrabold tracking-wider transition-all cursor-pointer ${
                    user.plan === "PRO" 
                      ? "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-600 text-slate-950 shadow-[0_0_8px_rgba(234,179,8,0.5)] border border-amber-400/20 hover:scale-105" 
                      : "bg-slate-800 text-slate-400 border border-slate-700/60 hover:bg-slate-700 hover:text-slate-200"
                  }`}
                  title="Lihat Plan & Pembayaran"
                >
                  {user.plan}
                </Link>
              </div>
              <p className="text-[10px] text-slate-500 font-semibold uppercase tracking-widest -mt-0.5">
                Elephant Brain OS
              </p>
            </div>
          )}
        </div>
        
        {/* Theme Toggle and Logout */}
        <div className={`flex items-center ${isCollapsed ? "flex-col space-y-3" : "space-x-2"}`}>
          <ThemeToggle isCollapsed={isCollapsed} />
          <button
            onClick={() => logout()}
            className="p-1.5 rounded-xl border border-slate-800 bg-slate-900/30 text-slate-400 hover:text-red-400 hover:border-red-500/30 hover:bg-red-500/10 transition-all cursor-pointer"
            title="Keluar"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>

      {/* Workspace Switcher */}
      {!isCollapsed && workspaces && workspaces.length > 0 && (
        <div className="px-6 mb-4">
          <div className="flex items-center justify-between mb-1">
            <label className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">
              Ruang Kerja (Workspace)
            </label>
            <button
              onClick={handleNewWorkspaceClick}
              className="text-[9px] text-[#0085FF] hover:text-blue-400 font-bold flex items-center space-x-0.5 cursor-pointer uppercase transition-colors"
            >
              <Plus size={10} />
              <span>Baru</span>
            </button>
          </div>
          <div className="relative">
            <select
              value={activeWorkspaceId || ""}
              onChange={(e) => setActiveWorkspaceId(e.target.value)}
              className="glass-input w-full px-3 py-2 rounded-xl text-xs font-semibold appearance-none bg-slate-900 border border-slate-800 cursor-pointer pr-8"
            >
              {workspaces.map((w) => (
                <option key={w.id} value={w.id} className="bg-[#0c1222] text-slate-100">
                  {w.id.includes("personal") ? "🏠 " : "🏢 "} {w.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
          </div>
        </div>
      )}

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
                <div className="flex items-center space-x-1.5">
                  <p className="text-[11px] text-[#0085FF] font-medium truncate">{title}</p>
                  {user.plan === "FREE" && (
                    <Link
                      href="/payment"
                      className="text-[9px] text-amber-500 hover:text-amber-400 font-bold hover:underline transition-colors shrink-0"
                    >
                      🚀 Upgrade
                    </Link>
                  )}
                </div>
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
        {filteredNavItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link 
              key={item.name} 
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all cursor-pointer ${
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
      <div className={`p-3 border-t border-slate-800/40 bg-slate-950/20 ${isCollapsed ? "flex flex-col items-center" : ""}`}>
        {isCollapsed ? (
          <div className="cursor-pointer" title="Pet Elphy" onClick={() => playWithPet()}>
            <span className="text-2xl animate-float block">🐘</span>
          </div>
        ) : (
          <div className="p-2.5 rounded-2xl bg-slate-900/30 border border-slate-850/60 flex items-center justify-between space-x-2.5 relative overflow-hidden">
            {/* Background subtle glow */}
            <div className="absolute -right-4 -bottom-4 w-12 h-12 bg-cyan-500/5 rounded-full blur-lg pointer-events-none"></div>

            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <div 
                className="relative cursor-pointer shrink-0" 
                onClick={() => playWithPet()} 
                title="Klik untuk bermain!"
              >
                <span className={`text-2xl animate-float block cursor-pointer select-none ${getPetColorClass(pet.color)}`}>
                  🐘
                </span>
                <span className="absolute -bottom-1 -right-1 text-[9px] bg-slate-950/90 px-0.5 py-0.2 rounded border border-slate-850 leading-none">
                  {getPetMoodEmoji(pet.mood)}
                </span>
              </div>
              <div className="min-w-0">
                <h5 className="font-bold text-slate-300 text-[11px] truncate">{pet.name}</h5>
                <p className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">
                  Lvl {pet.level} • {getPetMoodLabel(pet.mood)}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center space-x-1 shrink-0">
              <button
                onClick={() => playWithPet()}
                className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-[#0085FF] hover:border-[#0085FF]/20 transition-all cursor-pointer"
                title="Bermain"
              >
                <Sparkles size={11} />
              </button>
              
              <div className="relative">
                <button
                  onClick={() => setShowFeedOptions(!showFeedOptions)}
                  className="p-1.5 rounded-lg border border-slate-800 bg-slate-950/40 text-slate-400 hover:text-emerald-400 hover:border-emerald-500/20 transition-all cursor-pointer"
                  title="Beri Makan"
                >
                  <Utensils size={11} />
                </button>
                
                <AnimatePresence>
                  {showFeedOptions && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute bottom-full right-0 mb-1.5 w-32 glass-panel border border-slate-800/90 rounded-xl p-1 z-40 space-y-0.5"
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
                          className="w-full text-left px-2 py-1 hover:bg-slate-800 rounded-lg text-[9px] text-slate-300 font-medium transition-colors cursor-pointer"
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

      {/* Workspace Creation Modal */}
      <AnimatePresence>
        {showWorkspaceModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.2 }}
              className="glass-panel w-full max-w-md p-6 border border-slate-800 bg-[#0c1222] shadow-2xl rounded-2xl relative overflow-hidden"
            >
              {/* Glow accent */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-blue-500 via-cyan-400 to-purple-500" />
              <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-2xl" />

              {user.plan !== "PRO" ? (
                <div>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                      <Lock size={22} className="animate-pulse" />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-100">Fitur Organisasi Terkunci</h3>
                      <p className="text-xs text-amber-400/90 font-medium">Beralih ke Plan PRO sekarang</p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed mb-5 font-sans">
                    Membuat atau bergabung dengan organisasi/tim merupakan fitur eksklusif untuk pengguna **PRO**. 
                    Dengan akun PRO, Anda dapat berkolaborasi bersama tim (hingga 12 anggota), membagi tugas secara otomatis menggunakan AI Assistant, dan menyambungkan proyek ke Google & Looyal Calendar.
                  </p>

                  <div className="space-y-2 mb-6 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 font-sans">
                    <div className="flex items-center space-x-2 text-xs text-slate-300">
                      <span className="text-[#0085FF]">✦</span>
                      <span>Kolaborasi Tim hingga 12 Anggota</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-300">
                      <span className="text-[#0085FF]">✦</span>
                      <span>AI Assistant (Rekomendasi Prioritas, Estimasi Jam)</span>
                    </div>
                    <div className="flex items-center space-x-2 text-xs text-slate-300">
                      <span className="text-[#0085FF]">✦</span>
                      <span>Integrasi Kalender (Google Calendar & Looyal)</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setShowWorkspaceModal(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowWorkspaceModal(false);
                        router.push("/payment");
                      }}
                      className="px-4 py-2 text-xs font-bold text-slate-950 bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 transition-colors rounded-xl shadow-lg shadow-amber-500/10 cursor-pointer"
                    >
                      Upgrade ke PRO
                    </button>
                  </div>
                </div>
              ) : (
                <form onSubmit={handleCreateWorkspace}>
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                      <Plus size={22} />
                    </div>
                    <div>
                      <h3 className="font-bold text-lg text-slate-100">Buat Organisasi Baru</h3>
                      <p className="text-xs text-slate-500">Buat ruang kerja tim Anda</p>
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mb-1.5">
                      Nama Organisasi
                    </label>
                    <input
                      type="text"
                      value={newWorkspaceName}
                      onChange={(e) => setNewWorkspaceName(e.target.value)}
                      placeholder="Contoh: PT. Elphex Sukses"
                      disabled={isSubmittingWorkspace}
                      className="glass-input w-full px-3 py-2 rounded-xl text-sm"
                      maxLength={50}
                    />
                    {errorWorkspace && (
                      <p className="text-red-400 text-[11px] font-medium mt-1.5">
                        {errorWorkspace}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowWorkspaceModal(false);
                        setErrorWorkspace("");
                        setNewWorkspaceName("");
                      }}
                      disabled={isSubmittingWorkspace}
                      className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-slate-200 transition-colors cursor-pointer"
                    >
                      Batal
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmittingWorkspace}
                      className="px-4 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition-colors rounded-xl shadow-lg shadow-blue-500/10 cursor-pointer flex items-center space-x-1.5"
                    >
                      {isSubmittingWorkspace ? (
                        <span>Membuat...</span>
                      ) : (
                        <>
                          <Plus size={14} />
                          <span>Buat Organisasi</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
