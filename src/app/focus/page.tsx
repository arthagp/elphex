"use client";

import AppLayout from "@/components/layout/AppLayout";
import { useElphexStore } from "@/store/elphexStore";
import { useState, useEffect } from "react";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Coffee, 
  Target,
  Sparkles,
  Smile,
  Compass
} from "lucide-react";

export default function FocusPage() {
  const { 
    pomodoro, 
    tasks, 
    startPomodoro, 
    pausePomodoro, 
    resetPomodoro, 
    changeAmbientSound,
    pet
  } = useElphexStore();

  const [mounted, setMounted] = useState(false);
  const [selectedTaskId, setSelectedTaskId] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    const activeTodo = tasks.find(t => t.status !== "DONE");
    if (activeTodo) {
      setSelectedTaskId(activeTodo.id);
    }
  }, [tasks]);

  if (!mounted || !pet) return null;

  // Format seconds to MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Radial progress calculations
  const progressPercent = ((pomodoro.totalDuration - pomodoro.timeRemaining) / pomodoro.totalDuration) * 100;
  const radius = 90;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progressPercent / 100) * circumference;

  const ambientSounds = [
    { id: "NONE", name: "Tanpa Suara", icon: VolumeX },
    { id: "RAIN", name: "Hujan Cafe", icon: Volume2 },
    { id: "FOREST", name: "Hutan Hujan", icon: Compass },
    { id: "CAFE", name: "Kebisingan Kafe", icon: Coffee },
  ];

  return (
    <AppLayout>
      <div className="max-w-4xl mx-auto space-y-8 pb-12">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Fokus Pomodoro</h1>
          <p className="text-xs text-slate-500 font-medium">Bekerja tanpa distraksi untuk melatih konsentrasi dan meningkatkan XP Anda.</p>
        </div>

        {/* Main Pomodoro Layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left / Center: The Timer and Controls */}
          <div className="md:col-span-2 p-8 rounded-3xl glass-panel-glow flex flex-col items-center justify-center space-y-8 relative overflow-hidden">
            {/* Ambient sound background pulse */}
            {pomodoro.isRunning && pomodoro.ambientSound !== "NONE" && (
              <div className="absolute inset-0 bg-[#0085FF]/5 animate-pulse pointer-events-none"></div>
            )}

            {/* Mode Switcher */}
            <div className="flex p-1.5 rounded-2xl bg-slate-950/80 border border-slate-900 z-10">
              {[
                { type: "focus", label: "Fokus", duration: 25 },
                { type: "shortBreak", label: "Istirahat Pendek", duration: 5 },
                { type: "longBreak", label: "Istirahat Panjang", duration: 15 },
              ].map((mode) => (
                <button
                  key={mode.type}
                  onClick={() => startPomodoro(selectedTaskId || null, mode.type as any)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    pomodoro.type === mode.type
                      ? "bg-[#0085FF] text-white"
                      : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  {mode.label} ({mode.duration}m)
                </button>
              ))}
            </div>

            {/* Radial Clock Circle */}
            <div className="relative w-64 h-64 flex items-center justify-center z-10">
              <svg className="w-full h-full transform -rotate-90">
                {/* Background Track */}
                <circle
                  cx="128"
                  cy="128"
                  r={radius}
                  className="stroke-slate-950 fill-transparent"
                  strokeWidth="8"
                />
                {/* Animated Indicator */}
                <circle
                  cx="128"
                  cy="128"
                  r={radius}
                  className="fill-transparent stroke-dasharray transition-all duration-1000"
                  strokeWidth="8"
                  stroke={pomodoro.type === "focus" ? "#0085FF" : "#10b981"}
                  strokeLinecap="round"
                  style={{
                    strokeDasharray: circumference,
                    strokeDashoffset: strokeDashoffset,
                  }}
                />
              </svg>
              
              {/* Central Clock */}
              <div className="absolute flex flex-col items-center justify-center space-y-1">
                <span className="text-4xl font-black text-slate-100 tracking-tight">
                  {formatTime(pomodoro.timeRemaining)}
                </span>
                <span className="text-[10px] text-slate-500 font-extrabold uppercase tracking-widest">
                  {pomodoro.type === "focus" ? "Waktunya Fokus" : "Istirahat"}
                </span>
              </div>
            </div>

            {/* Main Controls */}
            <div className="flex items-center space-x-6 z-10">
              <button 
                onClick={resetPomodoro}
                className="p-3 rounded-2xl border border-slate-800 hover:border-slate-700 bg-slate-900/60 text-slate-400 hover:text-slate-200 transition-all cursor-pointer"
                title="Reset Timer"
              >
                <RotateCcw size={18} />
              </button>

              <button 
                onClick={pomodoro.isRunning ? pausePomodoro : () => startPomodoro(selectedTaskId || null, pomodoro.type)}
                className={`p-5 rounded-3xl transition-all cursor-pointer ${
                  pomodoro.isRunning 
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700 shadow-xl" 
                    : "bg-[#0085FF] text-white hover:bg-blue-600 shadow-xl shadow-blue-500/20"
                }`}
                title={pomodoro.isRunning ? "Pause" : "Start"}
              >
                {pomodoro.isRunning ? <Pause size={28} /> : <Play size={28} className="fill-current ml-1" />}
              </button>

              <div className="w-11"></div> {/* Spacer balance */}
            </div>
          </div>

          {/* Right Column: Settings & Companion Stats */}
          <div className="space-y-8">
            
            {/* Task Mapping */}
            <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800/40 space-y-4">
              <div className="flex items-center space-x-2">
                <Target size={16} className="text-[#0085FF]" />
                <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">Hubungkan Tugas</h3>
              </div>
              <p className="text-[10px] text-slate-500">
                Pilih tugas yang ingin diselesaikan. Sesi fokus yang sukses akan disimpan ke riwayat tugas ini.
              </p>
              <select
                value={selectedTaskId}
                onChange={(e) => setSelectedTaskId(e.target.value)}
                className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                disabled={pomodoro.isRunning}
              >
                <option value="">Fokus Umum (Bukan tugas spesifik)</option>
                {tasks.filter(t => t.status !== "DONE").map((t) => (
                  <option key={t.id} value={t.id}>{t.title}</option>
                ))}
              </select>
            </div>

            {/* Ambient Sound Settings */}
            <div className="p-6 rounded-2xl bg-slate-900/20 border border-slate-800/40 space-y-4">
              <div className="flex items-center space-x-2">
                <Volume2 size={16} className="text-[#0085FF]" />
                <h3 className="font-extrabold text-sm text-slate-200 uppercase tracking-wider">Suara Latar Belakang</h3>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {ambientSounds.map((sound) => {
                  const SoundIcon = sound.icon;
                  const isSelected = pomodoro.ambientSound === sound.id;
                  return (
                    <button
                      key={sound.id}
                      onClick={() => changeAmbientSound(sound.id)}
                      className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1 transition-all cursor-pointer ${
                        isSelected 
                          ? "bg-[#0085FF]/10 border-[#0085FF]/30 text-[#0085FF]" 
                          : "border-slate-850 hover:border-slate-800 text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      <SoundIcon size={16} />
                      <span className="text-[9px] font-bold">{sound.name}</span>
                    </button>
                  );
                })}
              </div>

              {/* simulated Equalizer waveform bar indicator if playing */}
              {pomodoro.isRunning && pomodoro.ambientSound !== "NONE" && (
                <div className="flex justify-center items-end space-x-1 h-6 py-1">
                  {Array.from({ length: 12 }).map((_, i) => {
                    const animDelay = `${i * 0.15}s`;
                    return (
                      <div 
                        key={i} 
                        style={{ animationDelay: animDelay }}
                        className="w-1 bg-[#0085FF] rounded-full animate-[equalizer_1.2s_ease-in-out_infinite]"
                      ></div>
                    );
                  })}
                  <style jsx global>{`
                    @keyframes equalizer {
                      0%, 100% { height: 4px; }
                      50% { height: 20px; }
                    }
                  `}</style>
                </div>
              )}
            </div>

            {/* Elph Companion State Card */}
            <div className="p-6 rounded-2xl bg-gradient-to-br from-blue-950/20 to-cyan-950/20 border border-blue-900/10 flex items-center space-x-4">
              <span className="text-4xl animate-bounce">🧐</span>
              <div className="space-y-0.5">
                <h4 className="font-extrabold text-xs text-slate-200 uppercase tracking-wider">{pet.name} Ikut Belajar!</h4>
                <p className="text-[10px] text-slate-400 leading-relaxed">
                  "Elphy memakai kacamata belajarnya. Fokus bersamamu meningkatkan fokusnya juga!"
                </p>
                <span className="inline-block text-[8px] bg-[#0085FF]/20 text-[#0085FF] font-black px-1.5 py-0.5 rounded uppercase mt-2">
                  Mood: FOCUSED
                </span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
