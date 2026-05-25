"use client";

import AppLayout from "@/components/layout/AppLayout";
import { useElphexStore } from "@/store/elphexStore";
import { useState, useEffect } from "react";
import { 
  Zap, 
  Users, 
  Clock, 
  CheckCircle,
  Flag,
  Flame,
  Award,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function SprintsPage() {
  const { activeSprint, tasks, user, pet, showXpGain } = useElphexStore();
  const [mounted, setMounted] = useState(false);

  // Herd Mode Race States
  const [isRaceActive, setIsRaceActive] = useState(false);
  const [raceTimeLeft, setRaceTimeLeft] = useState(15 * 60); // 15 mins
  const [raceTasksDone, setRaceTasksDone] = useState(2);
  const [raceTotalTasks, setRaceTotalTasks] = useState(5);
  const [liveActivities, setLiveActivities] = useState<string[]>([
    "Arthur bergabung ke Herd Mode Sprint.",
    "PachydermPro online.",
    "JumboPlanner online.",
  ]);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sprints countdown timer
  const [daysLeft, setDaysLeft] = useState(5);
  const [hoursLeft, setHoursLeft] = useState(12);

  // Live countdown for the 15-min Herd Race
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isRaceActive && raceTimeLeft > 0) {
      interval = setInterval(() => {
        setRaceTimeLeft((prev) => prev - 1);
        
        // Simulating collaborative team activities randomly during the race!
        if (Math.random() < 0.05) {
          const names = ["PachydermPro", "JumboPlanner"];
          const selectedName = names[Math.floor(Math.random() * names.length)];
          const events = [
            `${selectedName} menyelesaikan sub-tugas (+10 XP)!`,
            `${selectedName} memulai Sesi Pomodoro Fokus!`,
            `${selectedName} memberi makan pet elephant (+15 XP)!`,
          ];
          const newEvent = events[Math.floor(Math.random() * events.length)];
          
          setLiveActivities((prev) => [newEvent, ...prev.slice(0, 4)]);
          
          // Randomly complete race tasks
          if (Math.random() < 0.3) {
            setRaceTasksDone((prev) => {
              const nextVal = Math.min(prev + 1, raceTotalTasks);
              if (nextVal === raceTotalTasks) {
                // Win the race!
                setIsRaceActive(false);
                showXpGain(200, "Herd Mode Sprint Menang! (+200 Team XP)");
              }
              return nextVal;
            });
          }
        }
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRaceActive, raceTimeLeft, raceTotalTasks, showXpGain]);

  if (!mounted || !user || !pet) return null;

  const sprintTasks = tasks.filter((t) => t.status !== "DELETED");
  const sprintTasksDone = sprintTasks.filter((t) => t.status === "DONE").length;
  const sprintTotalTasks = sprintTasks.length;
  const sprintProgressPercent = sprintTotalTasks > 0 ? (sprintTasksDone / sprintTotalTasks) * 100 : 0;

  const formatRaceTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleStartRace = () => {
    setIsRaceActive(true);
    setRaceTimeLeft(15 * 60);
    setRaceTasksDone(1);
    setLiveActivities([
      "Arthur memicu Mode Balap Herd (+50 XP)!",
      "Seluruh tim mendapatkan notifikasi balapan!",
      "PachydermPro mulai memecah tugas.",
    ]);
    showXpGain(50, "Herd Mode Race Dimulai!");
  };

  const teamMembers = [
    { name: "Arthur (Kamu)", role: "Owner", active: true, avatar: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=arthur" },
    { name: "PachydermPro", role: "Admin", active: true, avatar: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=pachy" },
    { name: "JumboPlanner", role: "Member", active: true, avatar: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=jumbo" },
    { name: "ElephantRanger", role: "Viewer", active: false, avatar: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=ranger" },
  ];

  return (
    <AppLayout>
      <div className="max-w-5xl mx-auto space-y-8 pb-12">
        {/* Header Block */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Herd Mode Sprints</h1>
          <p className="text-xs text-slate-500 font-medium">Bekerja bersama tim Anda secara real-time untuk menyelesaikan sasaran sprint.</p>
        </div>

        {/* Sprint Summary Card */}
        {activeSprint ? (
          <div className="p-6 rounded-3xl glass-panel-glow border border-[#0085FF]/20 relative overflow-hidden space-y-6">
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#0085FF]/5 to-violet-500/5 rounded-full blur-3xl pointer-events-none"></div>

            {/* Title & Metadata */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] bg-[#0085FF]/10 text-[#0085FF] font-black px-2.5 py-1 rounded-xl border border-[#0085FF]/20 uppercase tracking-wider">
                  Sprint Aktif
                </span>
                <h3 className="font-extrabold text-lg text-slate-200 mt-2">{activeSprint.name}</h3>
              </div>

              <div className="flex items-center space-x-3 text-xs bg-slate-950/80 border border-slate-900 px-4 py-2.5 rounded-2xl shrink-0">
                <Clock size={16} className="text-cyan-400" />
                <div>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Sisa Waktu Sprint</p>
                  <p className="font-extrabold text-slate-200 mt-0.5">{daysLeft} Hari {hoursLeft} Jam</p>
                </div>
              </div>
            </div>

            {/* Team Progress Indicator with Elephant moving */}
            <div className="space-y-2 relative">
              <div className="flex justify-between text-xs text-slate-400 font-bold">
                <span>Kemajuan Kawanan (Herd Progress)</span>
                <span>{sprintTasksDone}/{sprintTotalTasks} Tugas Selesai ({Math.round(sprintProgressPercent)}%)</span>
              </div>
              
              <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden border border-slate-900 relative">
                {/* Visual indicator bar */}
                <div 
                  className="h-full bg-gradient-to-r from-[#0085FF] via-cyan-400 to-violet-500 transition-all duration-1000"
                  style={{ width: `${sprintProgressPercent}%` }}
                ></div>
                
                {/* Elephant mascot moving along progress bar */}
                {sprintProgressPercent > 0 && (
                  <div 
                    className="absolute top-1/2 -translate-y-1/2 -ml-2 text-sm transition-all duration-1000 select-none pointer-events-none"
                    style={{ left: `${Math.max(2, sprintProgressPercent - 3)}%` }}
                  >
                    🐘
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center glass-panel rounded-3xl border border-dashed border-slate-800 text-slate-500">
            Tidak ada sprint aktif untuk proyek ini.
          </div>
        )}

        {/* Sprints Content Panels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Sprints Left Side: Herd Race Mode (Killer feature #3) */}
          <div className="md:col-span-2 space-y-8">
            <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800/40 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Zap size={18} className="text-[#0085FF] animate-pulse" />
                  <h3 className="font-extrabold text-base text-slate-200 tracking-tight">Herd Mode Race Mode</h3>
                </div>
                <span className="text-[10px] bg-slate-950 text-slate-500 px-2 py-0.5 rounded-full border border-slate-900 font-bold">Real-time</span>
              </div>
              <p className="text-xs text-slate-400 leading-relaxed">
                Balapan Sprint Kawanan! Picu balapan 15 menit bersama tim Anda. Selesaikan sasaran balapan secara kolektif untuk melipatgandakan perolehan XP sprint!
              </p>

              {!isRaceActive ? (
                <button
                  onClick={handleStartRace}
                  className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#0085FF] to-violet-600 hover:from-blue-600 hover:to-violet-700 font-extrabold text-xs shadow-xl shadow-blue-500/10 tracking-wider uppercase transition-all cursor-pointer flex items-center justify-center space-x-2"
                >
                  <Sparkles size={14} />
                  <span>Mulai Balapan Selesai Cepat (Double XP)</span>
                </button>
              ) : (
                <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-900 space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-widest animate-pulse">Balapan Sedang Berjalan!</span>
                    <span className="font-mono font-extrabold text-sm text-slate-200 bg-red-500/10 border border-red-500/20 px-3 py-1 rounded-xl">
                      ⏱️ {formatRaceTime(raceTimeLeft)}
                    </span>
                  </div>

                  {/* Race progress bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                      <span>Tugas Balapan Selesai</span>
                      <span>{raceTasksDone}/{raceTotalTasks}</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-900 border border-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all duration-500" style={{ width: `${(raceTasksDone / raceTotalTasks) * 100}%` }}></div>
                    </div>
                  </div>

                  {/* Live Activity Log feed */}
                  <div className="space-y-2">
                    <h5 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Aktivitas Tim Kawanan</h5>
                    <div className="space-y-1.5 max-h-32 overflow-y-auto">
                      {liveActivities.map((act, idx) => (
                        <div key={idx} className="text-[10px] text-slate-400 font-medium flex items-center space-x-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-cyan-500"></div>
                          <span className="truncate">{act}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sprints Right Side: Team Presence indicator */}
          <div className="space-y-8">
            <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800/40 space-y-4">
              <div className="flex items-center space-x-2">
                <Users size={16} className="text-[#0085FF]" />
                <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">Anggota Tim Online</h3>
              </div>

              <div className="space-y-3">
                {teamMembers.map((member) => (
                  <div key={member.name} className="flex items-center justify-between p-2 rounded-xl bg-slate-900/45 border border-slate-850">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="relative">
                        <img 
                          src={member.avatar} 
                          alt={member.name} 
                          className="w-8 h-8 rounded-full border border-slate-700 bg-slate-850" 
                        />
                        {/* Status dot */}
                        <div className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-950 ${
                          member.active ? "bg-emerald-500 animate-pulse" : "bg-slate-600"
                        }`}></div>
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-200 truncate">{member.name}</p>
                        <p className="text-[9px] text-slate-500 font-medium mt-0.5">{member.role}</p>
                      </div>
                    </div>
                    
                    {member.active && (
                      <span className="text-[8px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-1.5 py-0.5 rounded uppercase font-bold shrink-0">
                        Aktif
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
