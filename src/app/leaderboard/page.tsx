"use client";

import AppLayout from "@/components/layout/AppLayout";
import { useElphexStore } from "@/store/elphexStore";
import { useState, useEffect } from "react";
import { 
  Trophy, 
  Flame, 
  Crown,
  PieChart as PieIcon,
  TrendingUp,
  Award
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip 
} from "recharts";

// Mock task contributions for Recharts Pie Chart
const taskContribution = [
  { name: "Arthur (Kamu)", value: 4, color: "#0085FF" },
  { name: "PachydermPro", value: 6, color: "#a855f7" },
  { name: "JumboPlanner", value: 3, color: "#10b981" },
];

export default function LeaderboardPage() {
  const { leaderboard, user, activeWorkspaceId } = useElphexStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !user) return null;

  const workspaceLeaderboard = leaderboard
    .filter((entry) => entry.workspaceId === activeWorkspaceId)
    .sort((a, b) => b.xp - a.xp)
    .map((entry, index) => ({ ...entry, rank: index + 1 }));

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header Block */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Papan Peringkat Tim</h1>
          <p className="text-xs text-slate-500 font-medium">Bandingkan aktivitas produktivitas mingguan Anda dengan rekan satu kawanan.</p>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Left Column: Leaderboard Table */}
          <div className="md:col-span-2 p-6 rounded-3xl glass-panel relative overflow-hidden space-y-6">
            <div className="flex items-center space-x-2 border-b border-slate-800/40 pb-4">
              <Trophy size={20} className="text-yellow-400" />
              <h3 className="font-extrabold text-slate-200 text-base">Klasemen Produktivitas Mingguan</h3>
            </div>

            <div className="space-y-3">
              {workspaceLeaderboard.map((entry, idx) => {
                const isMe = entry.userId === user.id;
                
                // Rank Styling
                const getRankColor = (rank: number) => {
                  if (rank === 1) return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20";
                  if (rank === 2) return "bg-slate-300/10 text-slate-300 border-slate-300/20";
                  if (rank === 3) return "bg-amber-600/10 text-amber-500 border-amber-600/20";
                  return "bg-slate-950 text-slate-500 border-slate-900";
                };

                return (
                  <div 
                    key={entry.id}
                    className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${
                      isMe 
                        ? "bg-[#0085FF]/10 border-[#0085FF]/30 shadow-inner" 
                        : "bg-slate-900/35 border-slate-850 hover:border-slate-800"
                    }`}
                  >
                    <div className="flex items-center space-x-4 min-w-0">
                      {/* Rank Indicator */}
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs border shrink-0 relative ${getRankColor(entry.rank)}`}>
                        {entry.rank === 1 && (
                          <Crown size={10} className="absolute -top-1.5 text-yellow-400 fill-yellow-400" />
                        )}
                        {entry.rank}
                      </div>

                      {/* Avatar & Meta */}
                      <img 
                        src={entry.userAvatar} 
                        alt={entry.userName} 
                        className="w-10 h-10 rounded-full border border-slate-700 bg-slate-850 shrink-0" 
                      />

                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-200 text-sm truncate">{entry.userName} {isMe && "(Kamu)"}</h4>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="text-[10px] text-slate-500 font-medium">🔥 {entry.streak} Hari Streak</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="font-extrabold text-sm text-slate-200">{entry.xp} XP</p>
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider mt-0.5">Minggu ini</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Analytics Insights */}
          <div className="space-y-8">
            
            {/* Team Contribution Pie Chart */}
            <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800/40 space-y-4">
              <div className="flex items-center space-x-2">
                <PieIcon size={16} className="text-[#0085FF]" />
                <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">Kontribusi Tugas Tim</h3>
              </div>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Persentase total tugas selesai yang dikontribusikan oleh masing-masing anggota kawanan minggu ini.
              </p>

              {/* Pie Chart display */}
              <div className="h-44 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={taskContribution}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {taskContribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ background: "rgba(15, 23, 42, 0.95)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", fontSize: "10px" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                
                <div className="absolute text-center">
                  <p className="text-lg font-black text-slate-200">13</p>
                  <p className="text-[8px] text-slate-500 font-bold uppercase tracking-widest">Tugas</p>
                </div>
              </div>

              {/* Legend */}
              <div className="space-y-1.5">
                {taskContribution.map((entry) => (
                  <div key={entry.name} className="flex justify-between items-center text-[10px] text-slate-400 font-medium">
                    <div className="flex items-center space-x-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }}></div>
                      <span>{entry.name}</span>
                    </div>
                    <span className="font-extrabold text-slate-300">{entry.value} Tugas ({Math.round((entry.value / 13) * 100)}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Team Motivational Tip */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-amber-950/20 to-yellow-950/20 border border-amber-900/10 flex items-center space-x-4">
              <span className="text-3xl shrink-0">👑</span>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">Kejar PachydermPro!</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  "PachydermPro memimpin dengan selisih 170 XP. Selesaikan 4 tugas lagi hari ini untuk merebut tahta peringkat 1!"
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
