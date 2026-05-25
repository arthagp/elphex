"use client";

import AppLayout from "@/components/layout/AppLayout";
import { useElphexStore, Task, Subtask } from "@/store/elphexStore";
import { useState, useEffect } from "react";
import { 
  Kanban, 
  List, 
  Clock, 
  Calendar as CalendarIcon, 
  Table as TableIcon,
  Plus,
  ArrowRight,
  Sparkles,
  Calendar,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  Trash2,
  Brain,
  CheckSquare,
  Search,
  SlidersHorizontal,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TasksPage() {
  const { 
    tasks, 
    projects, 
    sections, 
    activeProjectId, 
    activeView, 
    setActiveView, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskStatus,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    showXpGain
  } = useElphexStore();

  const [mounted, setMounted] = useState(false);
  
  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskSection, setNewTaskSection] = useState("");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Active Task Detail Drawer State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  // AI assistant loading state
  const [aiThinking, setAiThinking] = useState(false);
  const [aiResult, setAiResult] = useState<{ subtasks?: string[]; estimatedHours?: number; complexity?: string; suggestedPriority?: string; reasoning?: string; advice?: string } | null>(null);

  useEffect(() => {
    setMounted(true);
    if (sections.length > 0) {
      setNewTaskSection(sections[0].id);
    }
  }, [sections]);

  if (!mounted) return null;

  // Filter tasks based on active project, search query, priority
  const filteredTasks = tasks.filter((t) => {
    const matchesProject = t.projectId === activeProjectId;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === "ALL" || t.priority === selectedPriority;
    return matchesProject && matchesSearch && matchesPriority;
  });

  // Groups tasks by status (for Kanban Board)
  const tasksByStatus = {
    TODO: filteredTasks.filter((t) => t.status === "TODO"),
    IN_PROGRESS: filteredTasks.filter((t) => t.status === "IN_PROGRESS"),
    REVIEW: filteredTasks.filter((t) => t.status === "REVIEW"),
    DONE: filteredTasks.filter((t) => t.status === "DONE"),
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeProjectId || !newTaskSection) return;
    
    await addTask(newTaskTitle, activeProjectId, newTaskSection);
    setNewTaskTitle("");
    setShowAddTaskModal(false);
  };

  const handleAddSubtaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !selectedTask) return;
    
    await addSubtask(selectedTask.id, newSubtaskTitle);
    setNewSubtaskTitle("");
    
    // Refresh selected task reference in drawer
    const updated = useElphexStore.getState().tasks.find(t => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
  };

  // Elephant Brain AI actions
  const triggerAiAction = async (action: "breakdown" | "estimate" | "prioritize") => {
    if (!selectedTask) return;
    
    setAiThinking(true);
    setAiResult(null);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskTitle: selectedTask.title,
          description: selectedTask.description,
          action,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiResult(data);
        
        // If action is breakdown, auto-inject into subtasks
        if (action === "breakdown" && data.subtasks) {
          for (const sub of data.subtasks) {
            await addSubtask(selectedTask.id, sub);
          }
          // Refresh state
          const updated = useElphexStore.getState().tasks.find(t => t.id === selectedTask.id);
          if (updated) setSelectedTask(updated);
          showXpGain(30, "AI Memecah Subtugas!");
        }
      }
    } catch (e) {
      console.error("AI Assistant Error", e);
    } finally {
      setAiThinking(false);
    }
  };

  const viewTabs = [
    { id: "kanban", name: "Kanban Board", icon: Kanban },
    { id: "list", name: "Daftar", icon: List },
    { id: "timeline", name: "Timeline (Gantt)", icon: Clock },
    { id: "calendar", name: "Kalender", icon: CalendarIcon },
    { id: "table", name: "Tabel", icon: TableIcon },
  ] as const;

  return (
    <AppLayout>
      <div className="space-y-6 pb-12 relative h-full">
        {/* Header Block */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-100 tracking-tight">Pusat Tugas</h1>
            <p className="text-xs text-slate-500 font-medium">Kelola dan selesaikan tugas-tugas tim di sini.</p>
          </div>
          
          <button 
            onClick={() => setShowAddTaskModal(true)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0085FF] hover:bg-blue-600 font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
          >
            <Plus size={16} />
            <span>Tugas Baru</span>
          </button>
        </div>

        {/* View Switcher and Search Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-2 rounded-2xl bg-slate-900/40 border border-slate-800/20">
          {/* Tabs */}
          <div className="flex flex-wrap gap-1">
            {viewTabs.map((tab) => {
              const TabIcon = tab.icon;
              const isActive = activeView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveView(tab.id)}
                  className={`flex items-center space-x-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive 
                      ? "bg-[#0085FF] text-white shadow-md shadow-blue-500/10" 
                      : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/40"
                  }`}
                >
                  <TabIcon size={14} />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>

          {/* Search and Filters */}
          <div className="flex items-center space-x-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                type="text" 
                placeholder="Cari tugas..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="glass-input pl-9 pr-4 py-1.5 rounded-xl text-xs w-48 font-medium"
              />
            </div>
            
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`p-2 rounded-xl border transition-all cursor-pointer ${
                showFilters ? "border-[#0085FF] text-[#0085FF]" : "border-slate-800 hover:border-slate-700 text-slate-400"
              }`}
            >
              <SlidersHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Extended Filters Dropdown */}
        <AnimatePresence>
          {showFilters && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden p-4 rounded-xl border border-slate-800 bg-slate-900/30 flex flex-wrap gap-4 items-center"
            >
              <div className="space-y-1">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Prioritas</label>
                <div className="flex gap-1">
                  {["ALL", "LOW", "MEDIUM", "HIGH", "URGENT"].map((pri) => (
                    <button
                      key={pri}
                      onClick={() => setSelectedPriority(pri)}
                      className={`px-3 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                        selectedPriority === pri 
                          ? "bg-slate-800 border-slate-700 text-slate-200" 
                          : "border-transparent text-slate-500 hover:text-slate-300"
                      }`}
                    >
                      {pri}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main View Area */}
        <div className="flex-1 min-h-[500px]">
          {/* 1. KANBAN BOARD */}
          {activeView === "kanban" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {(["TODO", "IN_PROGRESS", "REVIEW", "DONE"] as const).map((status) => {
                const list = tasksByStatus[status];
                const headerColors = {
                  TODO: "from-slate-400 to-slate-500",
                  IN_PROGRESS: "from-blue-500 to-cyan-500",
                  REVIEW: "from-amber-500 to-orange-500",
                  DONE: "from-emerald-500 to-teal-500",
                };
                const statusTitles = {
                  TODO: "Untuk Dikerjakan",
                  IN_PROGRESS: "Sedang Dikerjakan",
                  REVIEW: "Ulasan / Uji",
                  DONE: "Selesai",
                };
                return (
                  <div key={status} className="p-4 rounded-2xl bg-slate-900/10 border border-slate-800/20 flex flex-col h-[550px]">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${headerColors[status]}`}></div>
                        <h4 className="font-bold text-xs text-slate-300 uppercase tracking-wider">{statusTitles[status]}</h4>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-800 text-slate-500 font-extrabold border border-slate-700/50">
                        {list.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                      {list.length === 0 ? (
                        <div className="border border-dashed border-slate-800/40 rounded-xl py-8 text-center text-[11px] text-slate-500 font-medium">
                          Kosong
                        </div>
                      ) : (
                        list.map((task) => (
                          <div 
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className="p-3.5 rounded-xl border border-slate-800/20 bg-slate-900/40 hover:border-slate-700/50 transition-all cursor-pointer relative group"
                          >
                            <h5 className="font-bold text-xs text-slate-200 line-clamp-2">{task.title}</h5>
                            
                            <div className="flex items-center justify-between mt-3">
                              <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold border ${
                                task.priority === "URGENT" 
                                  ? "bg-red-500/10 border-red-500/20 text-red-400" 
                                  : task.priority === "HIGH" 
                                    ? "bg-orange-500/10 border-orange-500/20 text-orange-400" 
                                    : "bg-blue-500/10 border-blue-500/20 text-blue-400"
                              }`}>
                                {task.priority}
                              </span>

                              {status !== "DONE" && (
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    toggleTaskStatus(task.id);
                                  }}
                                  className="w-5 h-5 rounded bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/30 text-slate-500 hover:text-emerald-400 transition-all cursor-pointer"
                                  title="Tandai Selesai"
                                >
                                  <ArrowRight size={10} />
                                </button>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 2. LIST VIEW */}
          {activeView === "list" && (
            <div className="p-6 rounded-2xl bg-slate-900/10 border border-slate-800/20 space-y-6">
              {sections.map((sec) => {
                const sectionTasks = filteredTasks.filter((t) => t.sectionId === sec.id);
                return (
                  <div key={sec.id} className="space-y-3">
                    <div className="flex items-center space-x-2 border-b border-slate-800/40 pb-2">
                      <ChevronDown size={14} className="text-slate-500" />
                      <h4 className="font-extrabold text-sm text-slate-300">{sec.name}</h4>
                      <span className="text-[10px] text-slate-500 font-bold">({sectionTasks.length})</span>
                    </div>

                    <div className="space-y-2">
                      {sectionTasks.length === 0 ? (
                        <p className="text-[11px] text-slate-500 italic pl-6">Tidak ada tugas di kolom ini.</p>
                      ) : (
                        sectionTasks.map((task) => (
                          <div 
                            key={task.id}
                            onClick={() => setSelectedTask(task)}
                            className="flex items-center justify-between p-3 rounded-xl border border-slate-800/20 bg-slate-900/45 hover:border-slate-800/80 transition-all cursor-pointer group"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleTaskStatus(task.id);
                                }}
                                className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 cursor-pointer ${
                                  task.status === "DONE" 
                                    ? "bg-emerald-500 border-emerald-400 text-slate-950 font-extrabold" 
                                    : "border-slate-700 hover:border-[#0085FF]"
                                }`}
                              >
                                {task.status === "DONE" && <CheckSquare size={10} className="text-slate-950" />}
                              </button>
                              <span className={`text-xs font-semibold truncate ${
                                task.status === "DONE" ? "text-slate-500 line-through" : "text-slate-200"
                              }`}>
                                {task.title}
                              </span>
                            </div>

                            <div className="flex items-center space-x-3 shrink-0">
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
                                <span className="text-[10px] text-slate-500 font-medium">
                                  {new Date(task.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                                </span>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* 3. TIMELINE / GANTT VIEW */}
          {activeView === "timeline" && (
            <div className="p-6 rounded-2xl bg-slate-900/10 border border-slate-800/20 overflow-x-auto">
              <div className="min-w-[800px] space-y-4">
                <div className="grid grid-cols-5 border-b border-slate-800/60 pb-2 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  <div className="col-span-2">Nama Tugas</div>
                  <div>Status</div>
                  <div>Prioritas</div>
                  <div>Rentang Garis Waktu</div>
                </div>

                <div className="space-y-3">
                  {filteredTasks.length === 0 ? (
                    <p className="text-slate-500 text-center py-6 text-xs">Tidak ada tugas.</p>
                  ) : (
                    filteredTasks.map((task, idx) => {
                      // Simulating random horizontal offset for Gantt bar visual
                      const offsetPercent = (idx * 15) % 45;
                      const widthPercent = 30 + ((idx * 7) % 25);
                      return (
                        <div 
                          key={task.id} 
                          onClick={() => setSelectedTask(task)}
                          className="grid grid-cols-5 items-center p-2.5 rounded-lg hover:bg-slate-900/40 border border-transparent hover:border-slate-800 cursor-pointer text-xs"
                        >
                          <div className="col-span-2 font-bold text-slate-300 truncate pr-4">{task.title}</div>
                          <div>
                            <span className={`text-[10px] font-bold ${
                              task.status === "DONE" ? "text-emerald-400" : "text-blue-400"
                            }`}>{task.status}</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400">{task.priority}</span>
                          </div>
                          
                          {/* Pure SVG Bar for Gantt representation */}
                          <div className="w-full h-4 bg-slate-950 rounded-full overflow-hidden relative">
                            <div 
                              className="h-full rounded-full bg-gradient-to-r from-[#0085FF] to-cyan-500 opacity-80"
                              style={{ 
                                marginLeft: `${offsetPercent}%`,
                                width: `${widthPercent}%`
                              }}
                            ></div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 4. CALENDAR VIEW */}
          {activeView === "calendar" && (
            <div className="p-6 rounded-2xl bg-slate-900/10 border border-slate-800/20">
              <div className="grid grid-cols-7 gap-2 text-center text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-4">
                {["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"].map(d => <div key={d}>{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-3 min-h-[350px]">
                {Array.from({ length: 28 }).map((_, idx) => {
                  const day = idx - 4; // Start offset to simulate month days
                  const today = 18; // assume today is 18
                  const matches = filteredTasks.filter(t => t.dueDate && new Date(t.dueDate).getDate() === day);
                  
                  return (
                    <div 
                      key={idx}
                      className={`p-2 rounded-xl border min-h-[70px] flex flex-col justify-between transition-all ${
                        day === today 
                          ? "bg-blue-500/10 border-blue-500/30 shadow-inner" 
                          : "bg-slate-950/40 border-slate-900"
                      }`}
                    >
                      <span className={`text-[10px] font-bold ${day === today ? "text-[#0085FF]" : "text-slate-500"}`}>
                        {day > 0 && day <= 30 ? day : ""}
                      </span>
                      
                      <div className="space-y-1">
                        {matches.slice(0, 2).map(task => (
                          <div 
                            key={task.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedTask(task);
                            }}
                            className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-[8px] font-bold text-slate-300 truncate cursor-pointer hover:border-slate-600"
                            title={task.title}
                          >
                            {task.title}
                          </div>
                        ))}
                        {matches.length > 2 && (
                          <div className="text-[7px] text-slate-500 font-extrabold text-center">+{matches.length - 2} more</div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* 5. TABLE VIEW */}
          {activeView === "table" && (
            <div className="p-6 rounded-2xl bg-slate-900/10 border border-slate-800/20 overflow-x-auto">
              <table className="w-full min-w-[700px] border-collapse text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800/60 text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                    <th className="pb-3">Judul Tugas</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Prioritas</th>
                    <th className="pb-3">Tenggat Waktu</th>
                    <th className="pb-3">Proyek</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-6 text-slate-500">Tidak ada tugas.</td>
                    </tr>
                  ) : (
                    filteredTasks.map((task) => {
                      const proj = projects.find(p => p.id === task.projectId);
                      return (
                        <tr 
                          key={task.id}
                          onClick={() => setSelectedTask(task)}
                          className="border-b border-slate-900/40 hover:bg-slate-900/40 cursor-pointer"
                        >
                          <td className="py-3.5 font-bold text-slate-300">{task.title}</td>
                          <td>
                            <span className={`text-[10px] font-extrabold px-1.5 py-0.5 rounded ${
                              task.status === "DONE" ? "bg-emerald-500/10 text-emerald-400" : "bg-blue-500/10 text-blue-400"
                            }`}>{task.status}</span>
                          </td>
                          <td>
                            <span className="text-[10px] text-slate-400">{task.priority}</span>
                          </td>
                          <td className="text-slate-500 font-medium">
                            {task.dueDate ? new Date(task.dueDate).toLocaleDateString("id-ID") : "-"}
                          </td>
                          <td>
                            <span className="text-[10px] font-bold text-slate-500" style={{ color: proj?.color }}>{proj?.name || "General"}</span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Task Detail Slider-over Panel */}
        <AnimatePresence>
          {selectedTask && (
            <>
              {/* Backdrop overlay */}
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => {
                  setSelectedTask(null);
                  setAiResult(null);
                }}
                className="fixed inset-0 bg-[#090e1a] z-40"
              />

              {/* Drawer Content */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] glass-panel border-l border-slate-800/80 bg-[#0a0f1d] shadow-2xl p-6 z-50 overflow-y-auto flex flex-col space-y-6"
              >
                {/* Drawer Header */}
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-2 text-[#0085FF] font-bold text-xs bg-[#0085FF]/10 px-2.5 py-1 rounded-xl border border-[#0085FF]/20">
                    <Brain size={14} />
                    <span>Detail Tugas</span>
                  </div>
                  <button 
                    onClick={() => {
                      setSelectedTask(null);
                      setAiResult(null);
                    }}
                    className="p-1 rounded-lg border border-slate-850 hover:bg-slate-800 text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    <X size={16} />
                  </button>
                </div>

                {/* Task Meta Details */}
                <div className="space-y-3">
                  <h3 className="font-extrabold text-lg text-slate-100 leading-snug">{selectedTask.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/20 p-3 rounded-xl border border-slate-900">
                    {selectedTask.description || "Tidak ada deskripsi."}
                  </p>
                  
                  <div className="flex flex-wrap gap-2 text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">Prioritas: {selectedTask.priority}</span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">Status: {selectedTask.status}</span>
                    {selectedTask.dueDate && (
                      <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300">Tenggat: {new Date(selectedTask.dueDate).toLocaleDateString("id-ID")}</span>
                    )}
                  </div>
                </div>

                <hr className="border-slate-800/40" />

                {/* Subtasks Section */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-200">Sub-tugas</h4>
                  <div className="space-y-2">
                    {selectedTask.subtasks.map((sub) => (
                      <div key={sub.id} className="flex items-center justify-between p-2.5 rounded-lg border border-slate-850 bg-slate-900/20">
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => toggleSubtask(sub.id, !sub.isDone)}
                            className={`w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 cursor-pointer ${
                              sub.isDone ? "bg-emerald-500 border-emerald-400 text-slate-950" : "border-slate-700"
                            }`}
                          >
                            {sub.isDone && <CheckSquare size={8} className="text-slate-950" />}
                          </button>
                          <span className={`text-xs font-semibold ${sub.isDone ? "text-slate-500 line-through" : "text-slate-300"}`}>
                            {sub.title}
                          </span>
                        </div>
                        <button 
                          onClick={async () => {
                            await deleteSubtask(sub.id);
                            const updated = useElphexStore.getState().tasks.find(t => t.id === selectedTask.id);
                            if (updated) setSelectedTask(updated);
                          }}
                          className="text-slate-600 hover:text-red-400 transition-colors p-1 rounded hover:bg-slate-800 cursor-pointer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))}

                    <form onSubmit={handleAddSubtaskSubmit} className="flex gap-2">
                      <input 
                        type="text" 
                        placeholder="Tambah sub-tugas baru..." 
                        value={newSubtaskTitle}
                        onChange={(e) => setNewSubtaskTitle(e.target.value)}
                        className="glass-input flex-1 px-3 py-1.5 rounded-xl text-xs"
                      />
                      <button 
                        type="submit"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        <Plus size={14} />
                      </button>
                    </form>
                  </div>
                </div>

                <hr className="border-slate-800/40" />

                {/* Elephant Brain AI Assistant Widget */}
                <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-950/20 to-purple-950/20 border border-blue-900/20 space-y-4">
                  <div className="flex items-center space-x-2 text-glow-blue">
                    <Sparkles className="text-cyan-400 animate-pulse" size={16} />
                    <h4 className="font-extrabold text-xs uppercase tracking-wider text-slate-200">Elephant Brain AI Assistant</h4>
                  </div>

                  <div className="flex gap-2">
                    <button 
                      onClick={() => triggerAiAction("breakdown")}
                      disabled={aiThinking}
                      className="flex-1 py-1.5 rounded-lg bg-[#0085FF]/10 border border-[#0085FF]/20 hover:bg-[#0085FF]/20 text-[#0085FF] font-bold text-[10px] transition-all cursor-pointer disabled:opacity-50"
                    >
                      Pecah Subtugas
                    </button>
                    <button 
                      onClick={() => triggerAiAction("estimate")}
                      disabled={aiThinking}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold text-[10px] transition-all cursor-pointer disabled:opacity-50"
                    >
                      Estimasi Jam
                    </button>
                    <button 
                      onClick={() => triggerAiAction("prioritize")}
                      disabled={aiThinking}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold text-[10px] transition-all cursor-pointer disabled:opacity-50"
                    >
                      Rekomendasi Prioritas
                    </button>
                  </div>

                  {/* AI Results Output */}
                  {aiThinking && (
                    <div className="flex items-center space-x-2 py-2 justify-center text-xs text-slate-400">
                      <span className="animate-bounce">🐘</span>
                      <span>Gajah sedang berfikir...</span>
                    </div>
                  )}

                  {aiResult && (
                    <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-900 text-[11px] text-slate-300 space-y-2 leading-relaxed">
                      {aiResult.estimatedHours && (
                        <p>⏱️ **Estimasi Waktu:** {aiResult.estimatedHours} jam (Kompleksitas: {aiResult.complexity})</p>
                      )}
                      {aiResult.suggestedPriority && (
                        <p>⚠️ **Saran Prioritas:** {aiResult.suggestedPriority}</p>
                      )}
                      {aiResult.reasoning && (
                        <p>**Analisis:** {aiResult.reasoning}</p>
                      )}
                      {aiResult.advice && (
                        <p className="text-cyan-400 italic">"{aiResult.advice}"</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-auto pt-4 flex gap-2">
                  <button 
                    onClick={async () => {
                      if (confirm("Apakah anda yakin ingin menghapus tugas ini?")) {
                        await deleteTask(selectedTask.id);
                        setSelectedTask(null);
                      }
                    }}
                    className="flex-1 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Hapus Tugas
                  </button>
                </div>

              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Create Task Modal */}
        <AnimatePresence>
          {showAddTaskModal && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddTaskModal(false)}
                className="fixed inset-0 bg-[#090e1a] z-40"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 m-auto w-[90%] max-w-[420px] h-fit glass-panel bg-[#0a0f1d] border border-slate-800 shadow-2xl p-6 rounded-2xl z-50 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">Tambah Tugas Baru</h3>
                  <button onClick={() => setShowAddTaskModal(false)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Judul Tugas</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Masukkan judul tugas..." 
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kolom / Tahapan</label>
                    <select
                      value={newTaskSection}
                      onChange={(e) => setNewTaskSection(e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs appearance-none"
                    >
                      {sections.map(s => <option key={s.id} value={s.id} className="bg-[#0a0f1d]">{s.name}</option>)}
                    </select>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#0085FF] hover:bg-blue-600 font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    Buat Tugas
                  </button>
                </form>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
