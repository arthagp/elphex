"use client";

import AppLayout from "@/components/layout/AppLayout";
import { useElphexStore } from "@/store/elphexStore";
import { getLevelTitle } from "@/lib/gameEngine";
import { 
  Flame, 
  Trophy, 
  Calendar, 
  CheckCircle,
  TrendingUp, 
  Play, 
  Award,
  Zap,
  Target
} from "lucide-react";
import Link from "next/link";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from "recharts";
import { useEffect, useState } from "react";

// Mock analytics data for Recharts
const focusData = [
  { day: "Sen", menit: 25 },
  { day: "Sel", menit: 50 },
  { day: "Rab", menit: 0 },
  { day: "Kam", menit: 75 },
  { day: "Jum", menit: 100 },
  { day: "Sab", menit: 25 },
  { day: "Min", menit: 50 },
];

export default function Home() {
  const { user, pet } = useElphexStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <AppLayout>
      {mounted && user && pet ? <DashboardContent user={user} pet={pet} /> : null}
    </AppLayout>
  );
}

function DashboardContent({ user, pet }: { user: any; pet: any }) {
  const { tasks, achievements, leaderboard, startPomodoro, toggleTaskStatus } = useElphexStore();

  const title = getLevelTitle(user.level);
  const activeTasks = tasks.filter((t) => t.status !== "DONE").slice(0, 3);
  const completedTasksCount = tasks.filter((t) => t.status === "DONE").length;
  const totalTasksCount = tasks.length;
  const completionPercent = totalTasksCount > 0 ? (completedTasksCount / totalTasksCount) * 100 : 0;

  // Daily Quests mock calculations
  const quests = [
    { id: 1, name: "Selesaikan 3 Tugas", progress: `${Math.min(completedTasksCount, 3)}/3`, done: completedTasksCount >= 3, reward: 50 },
    { id: 2, name: "Fokus Pomodoro (1 Sesi)", progress: "0/1", done: false, reward: 100 },
    { id: 3, name: "Beri Makan Elphy Sekali", progress: pet.mood === "EXCITED" ? "1/1" : "0/1", done: pet.mood === "EXCITED", reward: 15 },
  ];

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 rounded-3xl glass-panel relative overflow-hidden border border-slate-800/40">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0085FF]/10 to-violet-500/10 rounded-full blur-2xl"></div>
        <div className="space-y-1 relative z-10">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-100 to-slate-400">
            Selamat Datang Kembali, {user.name}! 🐘
          </h2>
          <p className="text-slate-400 text-sm font-medium">
            Gajah tidak pernah lupa. Hari ini kamu memiliki <span className="text-[#0085FF] font-bold">{activeTasks.length} tugas aktif</span> yang butuh perhatianmu.
          </p>
        </div>
        <Link href="/tasks" className="mt-4 md:mt-0 px-5 py-2.5 rounded-xl bg-[#0085FF] hover:bg-blue-600 font-semibold text-sm shadow-lg shadow-blue-500/20 transition-all cursor-pointer relative z-10 flex items-center space-x-2">
          <Zap size={16} />
          <span>Mulai Bekerja</span>
        </Link>
      </div>

      {/* Overview Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Card 1: Streak */}
        <div className="p-5 rounded-2xl bg-slate-900/45 border border-slate-800/40 relative overflow-hidden flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Flame size={24} className="fill-orange-400 animate-pulse" />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Streak Harian</p>
            <h3 className="text-xl font-extrabold text-slate-200 mt-0.5 text-glow-orange">{user.currentStreak} Hari</h3>
            <p className="text-[10px] text-slate-400 mt-0.5">Rekor terbaik: {user.longestStreak} hari</p>
          </div>
        </div>

        {/* Card 2: Level */}
        <div className="p-5 rounded-2xl bg-slate-900/45 border border-slate-800/40 relative overflow-hidden flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20 flex items-center justify-center shrink-0">
            <Trophy size={24} />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Peringkat Pengguna</p>
            <h3 className="text-xl font-extrabold text-slate-200 mt-0.5 text-glow-purple">Lvl {user.level}</h3>
            <p className="text-[10px] text-purple-400 mt-0.5 font-semibold truncate max-w-[130px]">{title}</p>
          </div>
        </div>

        {/* Card 3: Tasks completion */}
        <div className="p-5 rounded-2xl bg-slate-900/45 border border-slate-800/40 relative overflow-hidden flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Target size={24} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Penyelesaian Tugas</p>
            <h3 className="text-xl font-extrabold text-slate-200 mt-0.5 text-glow-blue">{completedTasksCount}/{totalTasksCount}</h3>
            <div className="w-full h-1.5 rounded-full bg-slate-950 mt-1.5 overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${completionPercent}%` }}></div>
            </div>
          </div>
        </div>

        {/* Card 4: Pet Mood */}
        <div className="p-5 rounded-2xl bg-slate-900/45 border border-slate-800/40 relative overflow-hidden flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 flex items-center justify-center shrink-0 text-2xl">
            🐘
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">Status Elph Pet</p>
            <h3 className="text-xl font-extrabold text-slate-200 mt-0.5">{pet.name}</h3>
            <p className="text-[10px] text-cyan-400 font-semibold mt-0.5">Mood: {pet.mood}</p>
          </div>
        </div>
      </div>

      {/* Content Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left / Middle: Quests & Active Tasks & Analytics */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Daily Quests Widget */}
          <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800/40 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg tracking-tight text-slate-200">Misi Harian</h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full border border-slate-700 font-semibold">Resets in 12h</span>
            </div>
            <div className="space-y-3">
              {quests.map((quest) => (
                <div key={quest.id} className="p-3.5 rounded-xl border border-slate-800/30 bg-slate-900/40 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${quest.done ? "bg-emerald-500/20 border-emerald-400 text-emerald-400" : "border-slate-700"}`}>
                      {quest.done && <CheckCircle size={12} />}
                    </div>
                    <div>
                      <p className={`text-sm font-semibold ${quest.done ? "text-slate-500 line-through" : "text-slate-300"}`}>{quest.name}</p>
                      <p className="text-[10px] text-[#0085FF] font-semibold mt-0.5">+{quest.reward} XP</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-400">{quest.progress}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Task Center */}
          <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800/40 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg tracking-tight text-slate-200">Tugas Penting Terdekat</h3>
              <Link href="/tasks" className="text-xs text-[#0085FF] hover:underline font-semibold cursor-pointer">Lihat Semua</Link>
            </div>

            <div className="space-y-3">
              {activeTasks.length === 0 ? (
                <p className="text-slate-500 text-center py-6 text-sm">Tidak ada tugas aktif! 🎉</p>
              ) : (
                activeTasks.map((task) => (
                  <div key={task.id} className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/20 hover:border-slate-700/50 transition-all flex items-center justify-between">
                    <div className="flex items-center space-x-4 min-w-0">
                      <button 
                        onClick={() => toggleTaskStatus(task.id)}
                        className="w-5 h-5 rounded-lg border border-slate-700 hover:border-[#0085FF] flex items-center justify-center transition-colors text-slate-950 hover:bg-[#0085FF]/10 shrink-0 cursor-pointer"
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-300 truncate">{task.title}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold border ${
                            task.priority === "URGENT" 
                              ? "bg-red-500/10 border-red-500/20 text-red-400" 
                              : task.priority === "HIGH" 
                                ? "bg-orange-500/10 border-orange-500/20 text-orange-400" 
                                : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                          }`}>
                            {task.priority}
                          </span>
                          {task.dueDate && (
                            <div className="flex items-center text-[10px] text-slate-500 font-medium">
                              <Calendar size={10} className="mr-1" />
                              <span>{new Date(task.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => startPomodoro(task.id, "focus")}
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-[#0085FF] transition-all cursor-pointer"
                      title="Fokus Tugas Ini"
                    >
                      <Play size={14} className="fill-current" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recharts Analytics Chart */}
          <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp size={18} className="text-[#0085FF]" />
                <h3 className="font-extrabold text-lg tracking-tight text-slate-200">Menit Fokus Minggu Ini</h3>
              </div>
              <span className="text-[10px] text-slate-500 font-semibold">Sen - Min</span>
            </div>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={focusData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorXp" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0085FF" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#0085FF" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#475569" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "11px" }}
                    labelStyle={{ color: "#94a3b8", fontWeight: "bold" }}
                  />
                  <Area type="monotone" dataKey="menit" stroke="#0085FF" strokeWidth={2} fillOpacity={1} fill="url(#colorXp)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* Right Column: Leaderboard Summary & Achievements */}
        <div className="space-y-8">
          
          {/* Leaderboard Summary Widget */}
          <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800/40 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg tracking-tight text-slate-200">Klasemen Mingguan</h3>
              <Link href="/leaderboard" className="text-xs text-[#0085FF] hover:underline font-semibold cursor-pointer">Selengkapnya</Link>
            </div>

            <div className="space-y-3">
              {leaderboard.slice(0, 3).map((entry, idx) => (
                <div key={entry.id} className={`p-3 rounded-xl border flex items-center justify-between ${
                  entry.userId === user.id 
                    ? "bg-[#0085FF]/10 border-[#0085FF]/20" 
                    : "bg-slate-900/40 border-slate-880/20"
                }`}>
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                      idx === 0 
                        ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20" 
                        : idx === 1 
                          ? "bg-slate-300/10 text-slate-300 border border-slate-300/20" 
                          : "bg-amber-600/10 text-amber-500 border border-amber-600/20"
                    }`}>
                      {entry.rank}
                    </div>
                    <img 
                      src={entry.userAvatar} 
                      alt={entry.userName} 
                      className="w-8 h-8 rounded-full border border-slate-700" 
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-300 truncate">{entry.userName}</p>
                      <p className="text-[10px] text-slate-500 mt-0.5">🔥 {entry.streak} Hari Streak</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-slate-400">{entry.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Achievements Summary Widget */}
          <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800/40 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-extrabold text-lg tracking-tight text-slate-200">Lencana Saya</h3>
              <span className="text-[10px] text-slate-500 font-semibold">
                {achievements.filter((a) => a.unlockedAt).length}/{achievements.length} Terbuka
              </span>
            </div>

            <div className="grid grid-cols-4 gap-3">
              {achievements.map((ach) => (
                <div 
                  key={ach.id} 
                  className={`aspect-square rounded-xl border flex flex-col items-center justify-center relative group cursor-help transition-all ${
                    ach.unlockedAt 
                      ? "bg-violet-950/20 border-violet-500/20 text-slate-200" 
                      : "bg-slate-950/40 border-slate-880/20 opacity-30"
                  }`}
                >
                  <span className="text-xl">{ach.icon}</span>
                  
                  {/* Tooltip on hover */}
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-40 p-2 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-400 font-medium text-center shadow-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
                    <p className="font-extrabold text-slate-200 mb-0.5">{ach.name}</p>
                    <p className="leading-tight">{ach.description}</p>
                    {ach.unlockedAt && (
                      <p className="text-violet-400 font-bold mt-1">Terbuka: {new Date(ach.unlockedAt).toLocaleDateString("id-ID")}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
