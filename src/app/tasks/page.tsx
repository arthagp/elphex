"use client";

import AppLayout from "@/components/layout/AppLayout";
import { useElphexStore, Task, Subtask, CustomFieldDefinition, TaskTemplate, BoardInvitation } from "@/store/elphexStore";
import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  Kanban, 
  List as ListIcon, 
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
  X,
  Lock,
  Bell,
  UserPlus,
  Save,
  Check,
  Tag,
  Eye,
  Pencil,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function TasksPage() {
  const { 
    user,
    tasks, 
    projects, 
    sections, 
    activeProjectId, 
    setActiveProjectId,
    activeWorkspaceId,
    activeView, 
    setActiveView, 
    addTask, 
    updateTask, 
    deleteTask, 
    toggleTaskStatus,
    addSubtask,
    toggleSubtask,
    deleteSubtask,
    showXpGain,
    addProject,
    addSection,
    addCustomFieldDef,
    addTaskTemplate,
    inviteMemberToBoard,
    respondToInvitation,
    taskTemplates,
    invitations,
    labels,
    addLabel,
    updateLabel,
    deleteLabel
  } = useElphexStore();

  const [mounted, setMounted] = useState(false);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);
  
  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPriority, setSelectedPriority] = useState<string>("ALL");
  const [showFilters, setShowFilters] = useState(false);

  // New Project/Board form state
  const [showAddProjectModal, setShowAddProjectModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectColor, setNewProjectColor] = useState("#0085FF");

  // New task form state
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskSection, setNewTaskSection] = useState("");
  const [newTaskDueDate, setNewTaskDueDate] = useState("");
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);

  // Inline task creation states
  const [activeInlineSectionId, setActiveInlineSectionId] = useState<string | null>(null);
  const [inlineTexts, setInlineTexts] = useState<Record<string, string>>({});

  // Add new List/Section state
  const [showAddSectionForm, setShowAddSectionForm] = useState(false);
  const [newSectionName, setNewSectionName] = useState("");

  // Active Task Detail Drawer State
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingTitle, setEditingTitle] = useState("");
  const [editingDescription, setEditingDescription] = useState("");
  const [editingStartDate, setEditingStartDate] = useState("");
  const [editingDueDate, setEditingDueDate] = useState("");
  const [editingReminder, setEditingReminder] = useState("NONE");
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false);

  // Save as Template UI state
  const [showSaveTemplateForm, setShowSaveTemplateForm] = useState(false);
  const [saveTemplateName, setSaveTemplateName] = useState("");

  // Add Custom Field UI state
  const [showAddFieldForm, setShowAddFieldForm] = useState(false);
  const [newFieldName, setNewFieldName] = useState("");
  const [newFieldType, setNewFieldType] = useState("TEXT");
  const [newFieldOptions, setNewFieldOptions] = useState("");

  // Add Collaborator search state
  const [collabQuery, setCollabQuery] = useState("");
  const [collabSearchResults, setCollabSearchResults] = useState<any[]>([]);
  const [collabSearchError, setCollabSearchError] = useState("");

  // Invitations popover state
  const [showInvitationsPopover, setShowInvitationsPopover] = useState(false);

  // AI assistant loading state
  const [aiThinking, setAiThinking] = useState(false);
  const [aiResult, setAiResult] = useState<{ subtasks?: string[]; estimatedHours?: number; complexity?: string; suggestedPriority?: string; reasoning?: string; advice?: string } | null>(null);

  // Label UI state
  const [showLabelText, setShowLabelText] = useState(false);
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [labelEditName, setLabelEditName] = useState("");
  const [labelEditColor, setLabelEditColor] = useState("");
  const [showCreateLabelForm, setShowCreateLabelForm] = useState(false);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#10B981");

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update default section for new task when project changes
  useEffect(() => {
    const firstSection = sections.find((s) => s.projectId === activeProjectId);
    if (firstSection) {
      setNewTaskSection(firstSection.id);
    }
  }, [sections, activeProjectId]);

  // Update detail editing inputs when selected task changes
  useEffect(() => {
    if (selectedTask) {
      setEditingTitle(selectedTask.title);
      setEditingDescription(selectedTask.description || "");
      setEditingStartDate(selectedTask.startDate ? new Date(selectedTask.startDate).toISOString().split("T")[0] : "");
      setEditingDueDate(selectedTask.dueDate ? new Date(selectedTask.dueDate).toISOString().split("T")[0] : "");
      setEditingReminder(selectedTask.dueDateReminder || "NONE");
      
      // Close forms inside drawer
      setShowSaveTemplateForm(false);
      setShowAddFieldForm(false);
      setCollabQuery("");
      setCollabSearchResults([]);
    }
  }, [selectedTask]);

  // Handle member search by typing
  useEffect(() => {
    const delayDebounce = setTimeout(async () => {
      if (collabQuery.trim().length >= 2) {
        try {
          const res = await fetch(`/api/users/search?username=${encodeURIComponent(collabQuery)}`);
          if (res.ok) {
            const data = await res.json();
            setCollabSearchResults(data);
          }
        } catch (e) {
          console.error(e);
        }
      } else {
        setCollabSearchResults([]);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [collabQuery]);

  if (!mounted) return null;

  const workspaceProjects = projects.filter((p) => p.workspaceId === activeWorkspaceId);
  const activeProject = projects.find((p) => p.id === activeProjectId);
  const projectSections = sections.filter((s) => s.projectId === activeProjectId);

  // Filter tasks based on active project, search query, priority
  const filteredTasks = tasks.filter((t) => {
    const matchesProject = t.projectId === activeProjectId;
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = selectedPriority === "ALL" || t.priority === selectedPriority;
    return matchesProject && matchesSearch && matchesPriority;
  });

  const projectTemplates = taskTemplates.filter((t) => t.projectId === activeProjectId);

  const handleUpdateTitle = async () => {
    if (!selectedTask || !editingTitle.trim() || editingTitle === selectedTask.title) return;
    await updateTask(selectedTask.id, { title: editingTitle });
    refreshSelectedTask();
  };

  const handleUpdateDescription = async () => {
    if (!selectedTask || editingDescription === (selectedTask.description || "")) return;
    await updateTask(selectedTask.id, { description: editingDescription });
    refreshSelectedTask();
  };

  const handleUpdateDates = async (field: "start" | "due" | "reminder", val: string) => {
    if (!selectedTask) return;
    const updates: any = {};
    if (field === "start") {
      updates.startDate = val ? new Date(val).toISOString() : null;
    } else if (field === "due") {
      updates.dueDate = val ? new Date(val).toISOString() : null;
    } else if (field === "reminder") {
      updates.dueDateReminder = val;
    }

    await updateTask(selectedTask.id, updates);
    refreshSelectedTask();
  };

  const handleUpdateCustomFieldVal = async (fieldId: string, val: string) => {
    if (!selectedTask) return;
    await updateTask(selectedTask.id, {
      customFieldValues: [{ fieldId, value: val } as any]
    });
    refreshSelectedTask();
  };

  const refreshSelectedTask = () => {
    if (!selectedTask) return;
    const updated = useElphexStore.getState().tasks.find(t => t.id === selectedTask.id);
    if (updated) setSelectedTask(updated);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.currentTarget.blur();
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !activeWorkspaceId) return;

    await addProject(newProjectName, newProjectColor, activeWorkspaceId);
    setNewProjectName("");
    setShowAddProjectModal(false);
  };

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim() || !activeProjectId || !newTaskSection) return;

    let payload: any = {
      dueDate: newTaskDueDate ? new Date(newTaskDueDate).toISOString() : null,
    };

    // If template selected, inject template properties
    if (selectedTemplateId) {
      const template = taskTemplates.find(t => t.id === selectedTemplateId);
      if (template) {
        payload.description = template.description || "";
        if (template.assigneeId) {
          payload.assigneeId = template.assigneeId;
        }
        if (template.customFields) {
          try {
            const cfObject = JSON.parse(template.customFields);
            payload.customFieldValues = Object.keys(cfObject).map(fieldId => ({
              fieldId,
              value: String(cfObject[fieldId]),
            }));
          } catch (e) {
            console.error("Error parsing template custom fields", e);
          }
        }
      }
    }

    await addTask(newTaskTitle, activeProjectId, newTaskSection, payload);
    setNewTaskTitle("");
    setNewTaskDueDate("");
    setSelectedTemplateId("");
    setShowAddTaskModal(false);
  };

  const handleAddSubtaskSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim() || !selectedTask) return;
    
    await addSubtask(selectedTask.id, newSubtaskTitle);
    setNewSubtaskTitle("");
    refreshSelectedTask();
  };

  const handleAddCustomFieldDef = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFieldName.trim() || !activeProjectId) return;

    // Optimistic: close the form immediately, store update is done inside addCustomFieldDef
    const fieldName = newFieldName;
    const fieldType = newFieldType;
    const fieldOptions = newFieldOptions;
    setNewFieldName("");
    setNewFieldOptions("");
    setShowAddFieldForm(false);

    await addCustomFieldDef(fieldName, fieldType, fieldOptions, activeProjectId);
    // No full page reload – the store already updates projects.customFieldDefs optimistically
    refreshSelectedTask();
  };

  const handleSaveAsTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!saveTemplateName.trim() || !selectedTask || !activeProjectId) return;

    const cfObject: Record<string, string> = {};
    selectedTask.customFieldValues?.forEach((cf) => {
      cfObject[cf.fieldId] = cf.value;
    });

    await addTaskTemplate(saveTemplateName, activeProjectId, {
      title: selectedTask.title,
      description: selectedTask.description,
      priority: selectedTask.priority,
      assigneeId: selectedTask.assignees?.[0]?.userId || null,
      customFields: cfObject,
    });

    setSaveTemplateName("");
    setShowSaveTemplateForm(false);
  };

  const handleInviteCollaborator = async (username: string) => {
    if (!activeProjectId) return;
    setCollabSearchError("");
    const result = await inviteMemberToBoard(username, activeProjectId);
    if (result.success) {
      setCollabQuery("");
      setCollabSearchResults([]);
    } else {
      setCollabSearchError(result.error || "Gagal mengundang pengguna");
    }
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
          refreshSelectedTask();
          showXpGain(30, "AI Memecah Subtugas!");
        }
      }
    } catch (e) {
      console.error("AI Assistant Error", e);
    } finally {
      setAiThinking(false);
    }
  };

  const colors = ["#0085FF", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444", "#EC4899", "#3B82F6"];

  const viewTabs = [
    { id: "kanban", name: "Kanban Board", icon: Kanban },
    { id: "list", name: "Daftar", icon: ListIcon },
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
          
          <div className="flex items-center space-x-3">
            {/* Board Selector */}
            {workspaceProjects.length > 0 && (
              <select
                value={activeProjectId || ""}
                onChange={(e) => setActiveProjectId(e.target.value)}
                className="glass-input px-3 py-1.5 rounded-xl text-xs font-semibold appearance-none bg-slate-900 border border-slate-800"
              >
                {workspaceProjects.map((p) => (
                  <option key={p.id} value={p.id} className="bg-white dark:bg-[#0a0f1d] text-slate-900 dark:text-slate-100">
                    📂 {p.name}
                  </option>
                ))}
              </select>
            )}

            {/* Create Board Button */}
            <button 
              onClick={() => setShowAddProjectModal(true)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border border-slate-800 hover:border-slate-700 bg-slate-900/40 text-slate-300 font-semibold text-xs transition-all cursor-pointer"
              title="Buat Board Baru"
            >
              <Plus size={14} />
              <span>Board Baru</span>
            </button>

            {/* Notifications Bell */}
            <div className="relative">
              <button 
                onClick={() => setShowInvitationsPopover(!showInvitationsPopover)}
                className={`p-2 rounded-xl border transition-all cursor-pointer relative ${
                  showInvitationsPopover ? "border-[#0085FF] text-[#0085FF]" : "border-slate-800 hover:border-slate-700 text-slate-400"
                }`}
              >
                <Bell size={15} />
                {invitations.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[9px] font-bold text-white flex items-center justify-center animate-pulse">
                    {invitations.length}
                  </span>
                )}
              </button>

              {/* Invitations Popover */}
              <AnimatePresence>
                {showInvitationsPopover && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-2 w-72 p-4 rounded-2xl border border-slate-800 bg-[#0c1324] shadow-2xl z-50 space-y-3"
                  >
                    <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Undangan Board</span>
                      <button onClick={() => setShowInvitationsPopover(false)} className="text-slate-500 hover:text-slate-300">
                        <X size={12} />
                      </button>
                    </div>

                    <div className="space-y-3 max-h-60 overflow-y-auto">
                      {invitations.length === 0 ? (
                        <p className="text-[10px] text-slate-500 italic text-center py-2">Tidak ada undangan tertunda</p>
                      ) : (
                        invitations.map((inv) => (
                          <div key={inv.id} className="p-2.5 rounded-xl bg-slate-900/50 border border-slate-850 space-y-2">
                            <p className="text-[11px] text-slate-300 leading-relaxed">
                              <strong>@{inv.inviter?.profile?.name || "Member"}</strong> mengundang Anda ke Board <strong>{inv.project?.name}</strong>.
                            </p>
                            <div className="flex gap-2">
                              <button 
                                onClick={async () => {
                                  await respondToInvitation(inv.id, "ACCEPT");
                                  setShowInvitationsPopover(false);
                                }}
                                className="flex-1 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/20 transition-all cursor-pointer text-center"
                              >
                                Terima
                              </button>
                              <button 
                                onClick={async () => {
                                  await respondToInvitation(inv.id, "DECLINE");
                                  setShowInvitationsPopover(false);
                                }}
                                className="flex-1 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[10px] font-bold border border-red-500/20 transition-all cursor-pointer text-center"
                              >
                                Tolak
                              </button>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            
            <button 
              onClick={() => {
                if (projectSections.length > 0) {
                  setNewTaskSection(projectSections[0].id);
                }
                setShowAddTaskModal(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-[#0085FF] hover:bg-blue-600 font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer shrink-0"
            >
              <Plus size={16} />
              <span>Tugas Baru</span>
            </button>
          </div>
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
          {/* 1. KANBAN BOARD (Dinamis berbasis projectSections) */}
          {activeView === "kanban" && (
            <div className="flex gap-6 overflow-x-auto pb-4 items-start">
              {projectSections.map((sec, idx) => {
                const list = filteredTasks.filter((t) => t.sectionId === sec.id);
                const headerColors = [
                  "from-slate-400 to-slate-500",
                  "from-blue-500 to-cyan-500",
                  "from-emerald-500 to-teal-500",
                  "from-amber-500 to-orange-500",
                  "from-pink-500 to-rose-500"
                ];
                const columnColor = headerColors[idx % headerColors.length];
                
                return (
                  <div 
                    key={sec.id} 
                    onDragOver={(e) => {
                      e.preventDefault();
                    }}
                    onDragEnter={() => setDragOverColumn(sec.id)}
                    onDragLeave={() => setDragOverColumn(null)}
                    onDrop={async (e) => {
                      e.preventDefault();
                      setDragOverColumn(null);
                      const taskId = e.dataTransfer.getData("text/plain");
                      if (taskId) {
                        await updateTask(taskId, { sectionId: sec.id });
                        // If dropped in last list, mark status as DONE
                        const isLast = idx === projectSections.length - 1;
                        const currentTask = tasks.find(t => t.id === taskId);
                        if (currentTask) {
                          if (isLast && currentTask.status !== "DONE") {
                            await toggleTaskStatus(taskId);
                          } else if (!isLast && currentTask.status === "DONE") {
                            await toggleTaskStatus(taskId);
                          }
                        }
                      }
                    }}
                    className={`shrink-0 w-72 p-4 rounded-2xl bg-column-bg border flex flex-col h-fit max-h-[750px] transition-all duration-300 ${
                      dragOverColumn === sec.id 
                        ? "border-[#0085FF] bg-[#0085FF]/5 shadow-lg shadow-blue-500/5 scale-[1.01]" 
                        : "border-column-border"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2.5 h-2.5 rounded-full bg-gradient-to-r ${columnColor}`}></div>
                        <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 uppercase tracking-wider">{sec.name}</h4>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-extrabold border border-slate-300 dark:border-slate-700/50">
                        {list.length}
                      </span>
                    </div>

                    <div className="space-y-3 flex-1 overflow-y-auto pr-1">
                      {list.length === 0 ? (
                        <div className="border border-dashed border-slate-300 dark:border-slate-800/60 rounded-xl py-8 text-center text-[11px] text-slate-500 font-medium">
                          Kosong
                        </div>
                      ) : (
                        list.map((task) => (
                          <div 
                            key={task.id}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", task.id);
                              e.currentTarget.style.opacity = "0.5";
                            }}
                            onDragEnd={(e) => {
                              e.currentTarget.style.opacity = "1";
                            }}
                            onClick={() => setSelectedTask(task)}
                            className="p-3 rounded-xl border border-column-border bg-card-bg hover:border-slate-300 dark:hover:border-slate-600 hover:shadow-md cursor-grab active:cursor-grabbing transition-all duration-200 relative group"
                          >
                            {task.labels && task.labels.length > 0 && (
                              <div className="flex flex-wrap gap-1 mb-2">
                                {task.labels.map(({ label }) => (
                                  <div 
                                    key={label.id} 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setShowLabelText(!showLabelText);
                                    }}
                                    className={`h-2 rounded-full shrink-0 transition-all duration-200 cursor-pointer flex items-center justify-center text-[7px] font-extrabold text-white uppercase tracking-wider ${
                                      showLabelText ? "w-auto px-2 h-4.5 text-[8px]" : "w-10"
                                    }`} 
                                    style={{ backgroundColor: label.color }} 
                                    title={label.name}
                                  >
                                    {showLabelText && <span className="truncate max-w-[80px]">{label.name}</span>}
                                  </div>
                                ))}
                              </div>
                            )}
                            <h5 className="font-bold text-xs text-slate-800 dark:text-slate-100 line-clamp-2 mb-2 font-sans">{task.title}</h5>
                            
                            {/* Custom Field Values on Card */}
                            {task.customFieldValues && task.customFieldValues.length > 0 && activeProject?.customFieldDefs && activeProject.customFieldDefs.length > 0 && (() => {
                              const visibleFields = task.customFieldValues
                                .filter(cfv => cfv.value && cfv.value.trim() !== "")
                                .slice(0, 3);
                              if (visibleFields.length === 0) return null;
                              return (
                                <div className="flex flex-col gap-0.5 mb-1">
                                  {visibleFields.map(cfv => {
                                    const def = activeProject.customFieldDefs?.find(d => d.id === cfv.fieldId);
                                    if (!def) return null;
                                    return (
                                      <span
                                        key={cfv.fieldId}
                                        className="text-[10px] text-slate-400 font-medium truncate"
                                        title={`${def.name}: ${cfv.value}`}
                                      >
                                        {def.name}: {cfv.value}
                                      </span>
                                    );
                                  })}
                                </div>
                              );
                            })()}

                            <div className="flex items-center justify-between mt-3 text-[10px] text-slate-400 font-medium">
                              <div className="flex items-center space-x-2">
                                <div className="flex items-center space-x-0.5">
                                  <Eye size={11} className="text-slate-500" />
                                </div>
                                {task.dueDate && (
                                  <div className="flex items-center space-x-1">
                                    <Clock size={11} className="text-slate-500" />
                                    <span>{new Date(task.dueDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
                                  </div>
                                )}
                                {task.priority && task.priority !== "NONE" && <span>Priority: {task.priority}</span>}
                              </div>

                              <div className="flex items-center space-x-1.5">
                                {task.assignees?.[0] && (
                                  <img 
                                    src={task.assignees[0].user?.profile?.avatarUrl || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${task.assignees[0].userId}`}
                                    alt="PIC"
                                    className="w-5 h-5 rounded-full border border-slate-800 bg-slate-900"
                                    title={task.assignees[0].user?.profile?.name || "PIC"}
                                  />
                                )}

                                {idx !== projectSections.length - 1 && (
                                  <button 
                                    onClick={async (e) => {
                                      e.stopPropagation();
                                      const nextSec = projectSections[idx + 1];
                                      if (nextSec) {
                                        await updateTask(task.id, { sectionId: nextSec.id });
                                        if (idx + 1 === projectSections.length - 1) {
                                          await toggleTaskStatus(task.id);
                                        }
                                      }
                                    }}
                                    className="w-4 h-4 rounded bg-slate-800 border border-slate-700 flex items-center justify-center hover:bg-emerald-500/20 hover:border-emerald-500/30 text-slate-500 hover:text-emerald-400 transition-all cursor-pointer shrink-0"
                                    title="Pindahkan ke kolom berikutnya"
                                  >
                                    <ArrowRight size={8} />
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                    {/* INLINE TASK CREATOR */}
                    {activeInlineSectionId === sec.id ? (
                      <form 
                        onSubmit={async (e) => {
                          e.preventDefault();
                          const text = inlineTexts[sec.id] || "";
                          if (!text.trim() || !activeProjectId) return;
                          await addTask(text, activeProjectId, sec.id);
                          setInlineTexts({ ...inlineTexts, [sec.id]: "" });
                          setActiveInlineSectionId(null);
                        }}
                        className="mt-3 p-2.5 bg-slate-50 dark:bg-slate-950/30 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2"
                      >
                        <input 
                          type="text"
                          placeholder="Tulis judul tugas..."
                          value={inlineTexts[sec.id] || ""}
                          onChange={(e) => setInlineTexts({ ...inlineTexts, [sec.id]: e.target.value })}
                          className="w-full bg-transparent border-0 border-b border-slate-250 dark:border-slate-800 focus:border-[#0085FF] focus:ring-0 text-xs text-slate-800 dark:text-slate-200 p-1 outline-none font-medium"
                          autoFocus
                        />
                        <div className="flex justify-end gap-1.5">
                          <button 
                            type="button" 
                            onClick={() => setActiveInlineSectionId(null)}
                            className="px-2.5 py-1 rounded-lg bg-slate-200 hover:bg-slate-300 dark:bg-slate-850 dark:hover:bg-slate-800 text-[10px] text-slate-600 dark:text-slate-400 font-bold cursor-pointer"
                          >
                            Batal
                          </button>
                          <button 
                            type="submit" 
                            className="px-2.5 py-1 rounded-lg bg-[#0085FF] hover:bg-blue-600 text-[10px] text-white font-bold cursor-pointer"
                          >
                            Tambah
                          </button>
                        </div>
                      </form>
                    ) : (
                      <button 
                        onClick={() => {
                          setActiveInlineSectionId(sec.id);
                          setInlineTexts({ ...inlineTexts, [sec.id]: "" });
                        }}
                        className="mt-3 w-full px-3 py-2 hover:bg-slate-200/40 dark:hover:bg-slate-900/40 rounded-xl text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 flex items-center justify-between transition-all cursor-pointer font-bold"
                      >
                        <div className="flex items-center space-x-2">
                          <Plus size={14} className="text-slate-400" />
                          <span>Tambah tugas</span>
                        </div>
                        <div className="w-5 h-5 rounded hover:bg-slate-300 dark:hover:bg-slate-800 flex items-center justify-center">
                          <Plus size={12} className="text-slate-400" />
                        </div>
                      </button>
                    )}
                  </div>
                );
              })}

              {/* Add New List Column */}
              <div className="shrink-0 w-72">
                {showAddSectionForm ? (
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      if (!newSectionName.trim() || !activeProjectId) return;
                      const name = newSectionName;
                      setNewSectionName("");
                      setShowAddSectionForm(false);
                      await addSection(name, activeProjectId);
                    }}
                    className="p-4 rounded-2xl bg-slate-900/60 border border-dashed border-slate-700 space-y-3"
                  >
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Nama List Baru</span>
                    <input
                      type="text"
                      required
                      autoFocus
                      value={newSectionName}
                      onChange={(e) => setNewSectionName(e.target.value)}
                      placeholder="Contoh: Review, QA, Staging..."
                      className="w-full bg-slate-950/50 border border-slate-800 focus:border-[#0085FF] focus:ring-0 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none"
                    />
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => { setShowAddSectionForm(false); setNewSectionName(""); }}
                        className="flex-1 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-[10px] text-slate-400 font-bold cursor-pointer"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="flex-1 py-1.5 rounded-lg bg-[#0085FF] hover:bg-blue-600 text-[10px] text-white font-bold cursor-pointer"
                      >
                        Buat List
                      </button>
                    </div>
                  </form>
                ) : (
                  <button
                    onClick={() => setShowAddSectionForm(true)}
                    className="w-full h-16 rounded-2xl border-2 border-dashed border-slate-800 hover:border-slate-600 hover:bg-slate-900/30 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 text-xs font-bold transition-all cursor-pointer group"
                  >
                    <Plus size={16} className="group-hover:text-[#0085FF] transition-colors" />
                    <span>Tambah List</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* 2. LIST VIEW */}
          {activeView === "list" && (
            <div className="p-6 rounded-2xl bg-slate-900/10 border border-slate-800/20 space-y-6">
              {projectSections.map((sec) => {
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
                              {task.assignees?.[0] && (
                                <div className="flex items-center space-x-1.5 bg-slate-950/40 px-2 py-0.5 rounded-lg border border-slate-850">
                                  <img 
                                    src={task.assignees[0].user?.profile?.avatarUrl || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${task.assignees[0].userId}`}
                                    alt="PIC"
                                    className="w-4 h-4 rounded-full border border-slate-700 bg-slate-800"
                                  />
                                  <span className="text-[9px] text-slate-400 font-semibold max-w-[80px] truncate">
                                    {task.assignees[0].user?.profile?.name || "PIC"}
                                  </span>
                                </div>
                              )}
                              
                              {task.priority && task.priority !== "NONE" && (
                                <span className={`text-[9px] px-1.5 py-0.5 rounded font-extrabold border ${
                                    task.priority === "URGENT" 
                                      ? "bg-red-500/10 border-red-500/20 text-red-400" 
                                      : task.priority === "HIGH" 
                                        ? "bg-orange-500/10 border-orange-500/20 text-orange-400" 
                                        : task.priority === "MEDIUM"
                                          ? "bg-blue-500/10 border-blue-500/20 text-blue-400"
                                          : "bg-slate-500/10 border-slate-500/20 text-slate-400" // LOW
                                }`}>
                                  {task.priority}
                                </span>
                              )}
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
                  const day = idx - 4;
                  const today = 18;
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
                    <th className="pb-3">PIC</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3">Prioritas</th>
                    <th className="pb-3">Tenggat Waktu</th>
                    <th className="pb-3">Proyek</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTasks.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-6 text-slate-500">Tidak ada tugas.</td>
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
                            {task.assignees?.[0] ? (
                              <div className="flex items-center space-x-1.5">
                                <img 
                                  src={task.assignees[0].user?.profile?.avatarUrl || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${task.assignees[0].userId}`}
                                  alt="PIC"
                                  className="w-4 h-4 rounded-full border border-slate-700 bg-slate-800"
                                />
                                <span className="text-[10px] text-slate-400 font-semibold">
                                  {task.assignees[0].user?.profile?.name || "PIC"}
                                </span>
                              </div>
                            ) : (
                              <span className="text-[10px] text-slate-500 font-medium italic">Belum ditunjuk</span>
                            )}
                          </td>
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
                className="fixed inset-0 bg-black/50 z-40"
              />

              {/* Drawer Content */}
              <motion.div
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", damping: 25, stiffness: 200 }}
                className="fixed right-0 top-0 bottom-0 w-full sm:w-[480px] bg-slate-950 border-l border-slate-800/80 shadow-2xl p-6 z-50 overflow-y-auto flex flex-col space-y-6"
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
                  <input
                    type="text"
                    value={editingTitle}
                    onChange={(e) => setEditingTitle(e.target.value)}
                    onBlur={handleUpdateTitle}
                    onKeyDown={handleTitleKeyDown}
                    className="w-full bg-transparent border-0 border-b border-transparent hover:border-slate-850 focus:border-[#0085FF] focus:ring-0 font-extrabold text-lg text-slate-100 leading-snug p-0 focus:outline-none transition-colors"
                    placeholder="Judul Tugas..."
                  />
                  <textarea
                    value={editingDescription}
                    onChange={(e) => setEditingDescription(e.target.value)}
                    onBlur={handleUpdateDescription}
                    rows={2}
                    className="w-full bg-slate-950/10 hover:bg-slate-950/25 focus:bg-slate-950/30 text-xs text-slate-400 leading-relaxed p-3 rounded-xl border border-slate-900 focus:border-[#0085FF] focus:ring-0 focus:outline-none resize-none transition-colors"
                    placeholder="Tambah deskripsi tugas di sini..."
                  />
                  
                   <div className="flex flex-wrap gap-2 text-[10px] font-bold items-center">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 uppercase">Status: {selectedTask.status}</span>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Dates & Reminder</label>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <span className="text-[9px] text-slate-500">Mulai</span>
                        <input 
                          type="date"
                          value={editingStartDate}
                          onChange={(e) => {
                            setEditingStartDate(e.target.value);
                            handleUpdateDates("start", e.target.value);
                          }}
                          className="glass-input w-full px-2 py-1 rounded-lg text-xs"
                        />
                      </div>
                      <div>
                        <span className="text-[9px] text-slate-500">Tenggat (Due)</span>
                        <input 
                          type="date"
                          value={editingDueDate}
                          onChange={(e) => {
                            setEditingDueDate(e.target.value);
                            handleUpdateDates("due", e.target.value);
                          }}
                          className="glass-input w-full px-2 py-1 rounded-lg text-xs"
                        />
                      </div>
                    </div>
                    <div className="mt-2">
                      <span className="text-[9px] text-slate-500">Pengingat (Reminder)</span>
                      <select
                        value={editingReminder}
                        onChange={(e) => {
                          setEditingReminder(e.target.value);
                          handleUpdateDates("reminder", e.target.value);
                        }}
                        className="glass-input w-full px-2 py-1 rounded-lg text-xs"
                      >
                        <option value="NONE">Tanpa Pengingat</option>
                        <option value="DUE_TIME">Saat Jatuh Tempo</option>
                        <option value="5_MIN">5 Menit Sebelum</option>
                        <option value="15_MIN">15 Menit Sebelum</option>
                        <option value="1_HOUR">1 Jam Sebelum</option>
                        <option value="1_DAY">1 Hari Sebelum</option>
                      </select>
                    </div>
                  </div>


                </div>

                <hr className="border-slate-800/40" />

                {/* Labels Section */}
                <div className="space-y-3">
                  {editingLabelId ? (
                    /* 1. Edit Label Sub-view */
                    <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
                      {/* Sub-view Header */}
                      <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                        <button
                          type="button"
                          onClick={() => setEditingLabelId(null)}
                          className="text-slate-400 hover:text-slate-200 flex items-center space-x-1 font-bold text-xs"
                        >
                          <ChevronLeft size={14} />
                          <span>Kembali</span>
                        </button>
                        <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Edit Label</span>
                        <button
                          type="button"
                          onClick={() => setEditingLabelId(null)}
                          className="text-slate-500 hover:text-slate-300"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Label Preview */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Pratinjau</span>
                        <div 
                          className="h-8.5 flex items-center justify-center rounded-lg text-white font-extrabold text-xs shadow-sm transition-all truncate px-3"
                          style={{ backgroundColor: labelEditColor }}
                        >
                          {labelEditName || "Nama Label"}
                        </div>
                      </div>

                      {/* Title Input */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Title</span>
                        <input 
                          type="text" 
                          required
                          value={labelEditName}
                          onChange={(e) => setLabelEditName(e.target.value)}
                          placeholder="Masukkan nama label..."
                          className="w-full bg-[#0c1324] border border-slate-800 focus:border-[#0085FF] focus:ring-0 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none outline-none"
                        />
                      </div>

                      {/* Color Presets */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Pilih Warna</span>
                        <div className="flex flex-wrap gap-2.5">
                          {["#216e4e", "#7f5f01", "#a54800", "#ae2e24", "#5e4db2", "#0c66e4"].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setLabelEditColor(color)}
                              className={`w-6 h-6 rounded-full border-2 transition-all ${
                                labelEditColor === color ? "border-white scale-110" : "border-transparent opacity-85"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                          {/* Custom Color Selector */}
                          <div className="relative w-6 h-6 rounded-full border border-dashed border-slate-700 hover:border-slate-500 cursor-pointer flex items-center justify-center overflow-hidden" title="Warna Kustom">
                            <Plus size={10} className="text-slate-400" />
                            <input 
                              type="color" 
                              value={labelEditColor} 
                              onChange={(e) => setLabelEditColor(e.target.value)} 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 pt-2">
                        <button 
                          onClick={async () => {
                            if (!labelEditName.trim()) return;
                            await updateLabel(editingLabelId, labelEditName, labelEditColor);
                            setEditingLabelId(null);
                          }}
                          className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold rounded-xl text-xs transition-colors cursor-pointer text-center"
                        >
                          Simpan Perubahan
                        </button>
                        <button
                          onClick={async () => {
                            if (confirm("Apakah Anda yakin ingin menghapus label ini?")) {
                              await deleteLabel(editingLabelId);
                              setEditingLabelId(null);
                            }
                          }}
                          className="w-full py-2 border border-red-500/20 hover:bg-red-500/10 text-red-400 font-bold rounded-xl text-xs transition-colors cursor-pointer text-center"
                        >
                          Hapus Label
                        </button>
                      </div>
                    </div>
                  ) : showCreateLabelForm ? (
                    /* 2. Create Label Sub-view */
                    <div className="p-3.5 rounded-2xl bg-slate-900/40 border border-slate-800/80 space-y-4">
                      {/* Sub-view Header */}
                      <div className="flex justify-between items-center pb-2 border-b border-slate-850">
                        <button
                          type="button"
                          onClick={() => setShowCreateLabelForm(false)}
                          className="text-slate-400 hover:text-slate-200 flex items-center space-x-1 font-bold text-xs"
                        >
                          <ChevronLeft size={14} />
                          <span>Kembali</span>
                        </button>
                        <span className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Buat Label Baru</span>
                        <button
                          type="button"
                          onClick={() => setShowCreateLabelForm(false)}
                          className="text-slate-500 hover:text-slate-300"
                        >
                          <X size={14} />
                        </button>
                      </div>

                      {/* Preview */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Pratinjau</span>
                        <div 
                          className="h-8.5 flex items-center justify-center rounded-lg text-white font-extrabold text-xs shadow-sm transition-all truncate px-3"
                          style={{ backgroundColor: newLabelColor }}
                        >
                          {newLabelName || "Nama Label"}
                        </div>
                      </div>

                      {/* Title Input */}
                      <div className="space-y-1">
                        <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Title</span>
                        <input 
                          type="text" 
                          required
                          value={newLabelName}
                          onChange={(e) => setNewLabelName(e.target.value)}
                          placeholder="Masukkan nama label..."
                          className="w-full bg-[#0c1324] border border-slate-800 focus:border-[#0085FF] focus:ring-0 rounded-xl px-3 py-2 text-xs text-slate-200 font-semibold focus:outline-none outline-none"
                        />
                      </div>

                      {/* Preset Colors */}
                      <div className="space-y-1.5">
                        <span className="text-[10px] text-slate-500 uppercase font-extrabold block">Pilih Warna</span>
                        <div className="flex flex-wrap gap-2.5">
                          {["#216e4e", "#7f5f01", "#a54800", "#ae2e24", "#5e4db2", "#0c66e4"].map((color) => (
                            <button
                              key={color}
                              type="button"
                              onClick={() => setNewLabelColor(color)}
                              className={`w-6 h-6 rounded-full border-2 transition-all ${
                                newLabelColor === color ? "border-white scale-110" : "border-transparent opacity-85"
                              }`}
                              style={{ backgroundColor: color }}
                            />
                          ))}
                          {/* Custom Color Selector */}
                          <div className="relative w-6 h-6 rounded-full border border-dashed border-slate-700 hover:border-slate-500 cursor-pointer flex items-center justify-center overflow-hidden" title="Warna Kustom">
                            <Plus size={10} className="text-slate-400" />
                            <input 
                              type="color" 
                              value={newLabelColor} 
                              onChange={(e) => setNewLabelColor(e.target.value)} 
                              className="absolute inset-0 opacity-0 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Submit Button */}
                      <button 
                        onClick={async (e) => {
                          e.preventDefault();
                          if (!newLabelName.trim() || !activeWorkspaceId) return;
                          await addLabel(newLabelName, newLabelColor, activeWorkspaceId);
                          setNewLabelName("");
                          setShowCreateLabelForm(false);
                        }}
                        className="w-full py-2 bg-[#0085FF] hover:bg-blue-600 text-white font-extrabold rounded-xl text-xs transition-colors cursor-pointer text-center"
                      >
                        Buat Label
                      </button>
                    </div>
                  ) : (
                    /* 3. Labels List Sub-view (Default view) */
                    <>
                      <div className="flex justify-between items-center">
                        <h4 className="font-extrabold text-sm text-slate-200">Labels</h4>
                        <button 
                          onClick={() => {
                            setNewLabelName("");
                            setNewLabelColor("#216e4e");
                            setShowCreateLabelForm(true);
                          }}
                          className="text-[10px] font-bold text-[#0085FF] hover:underline flex items-center space-x-1"
                        >
                          <Plus size={10} />
                          <span>Buat Label</span>
                        </button>
                      </div>

                      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                        {labels.filter(l => l.workspaceId === activeWorkspaceId).length === 0 ? (
                          <p className="text-[10px] text-slate-500 italic">Belum ada label di workspace ini.</p>
                        ) : (
                          labels.filter(l => l.workspaceId === activeWorkspaceId).map((lbl) => {
                            const isChecked = selectedTask.labels?.some(tl => tl.label.id === lbl.id);
                            return (
                              <div 
                                key={lbl.id} 
                                className="flex items-center justify-between py-1"
                              >
                                <label className="flex items-center space-x-3 cursor-pointer flex-1 select-none min-w-0">
                                  <input 
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={async (e) => {
                                      let newLabelIds = selectedTask.labels?.map(tl => tl.label.id) || [];
                                      if (e.target.checked) {
                                        newLabelIds.push(lbl.id);
                                      } else {
                                        newLabelIds = newLabelIds.filter(id => id !== lbl.id);
                                      }
                                      await updateTask(selectedTask.id, { labels: newLabelIds });
                                      refreshSelectedTask();
                                    }}
                                    className="w-4 h-4 rounded border-slate-700 text-[#0085FF] focus:ring-0 cursor-pointer bg-slate-950 shrink-0"
                                  />
                                  <div 
                                    className="h-8.5 flex items-center px-3 rounded-lg text-white font-extrabold text-xs flex-1 min-w-0 truncate shadow-sm hover:opacity-90 active:scale-[0.99] transition-all"
                                    style={{ backgroundColor: lbl.color }}
                                    title={lbl.name}
                                  >
                                    {lbl.name}
                                  </div>
                                </label>
                                
                                <button
                                  onClick={() => {
                                    setEditingLabelId(lbl.id);
                                    setLabelEditName(lbl.name);
                                    setLabelEditColor(lbl.color);
                                  }}
                                  className="p-2 rounded-lg border border-slate-850 hover:border-slate-800 bg-slate-900/40 text-slate-400 hover:text-slate-200 transition-all ml-2.5 shrink-0"
                                  title="Edit Label"
                                >
                                  <Pencil size={12} />
                                </button>
                              </div>
                            );
                          })
                        )}
                      </div>
                    </>
                  )}
                </div>

                <hr className="border-slate-800/40" />

                {/* Custom Fields Section */}
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-sm text-slate-200">Field Kustom</h4>
                    <button 
                      onClick={() => setShowAddFieldForm(!showAddFieldForm)}
                      className="text-[10px] font-bold text-[#0085FF] hover:underline flex items-center space-x-1"
                    >
                      <Plus size={10} />
                      <span>Definisikan Field</span>
                    </button>
                  </div>

                  {showAddFieldForm && (
                    <form onSubmit={handleAddCustomFieldDef} className="p-3 rounded-xl bg-slate-900/40 border border-slate-850 space-y-3">
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 uppercase font-bold">Nama Field</span>
                        <input 
                          type="text" 
                          required
                          value={newFieldName}
                          onChange={(e) => setNewFieldName(e.target.value)}
                          placeholder="Contoh: Estimasi Jam"
                          className="glass-input w-full px-2 py-1 rounded-lg text-xs"
                        />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[9px] text-slate-500 uppercase font-bold">Tipe Data</span>
                        <select
                          value={newFieldType}
                          onChange={(e) => setNewFieldType(e.target.value)}
                          className="glass-input w-full px-2 py-1 rounded-lg text-xs"
                        >
                          <option value="TEXT">Teks / Dropdown</option>
                          <option value="NUMBER">Angka (Number)</option>
                          <option value="DROPDOWN">Pilihan (Dropdown)</option>
                        </select>
                      </div>
                      {newFieldType === "DROPDOWN" && (
                        <div className="space-y-1">
                          <span className="text-[9px] text-slate-500 uppercase font-bold">Opsi (Pisahkan dengan koma)</span>
                          <input 
                            type="text" 
                            required
                            value={newFieldOptions}
                            onChange={(e) => setNewFieldOptions(e.target.value)}
                            placeholder="Contoh: Low,Medium,High"
                            className="glass-input w-full px-2 py-1 rounded-lg text-xs"
                          />
                        </div>
                      )}
                      <button 
                        type="submit"
                        className="w-full py-1.5 bg-[#0085FF] text-white rounded-lg text-[10px] font-bold"
                      >
                        Buat Field Kustom
                      </button>
                    </form>
                  )}

                  {/* Render Custom Fields and Values */}
                  <div className="space-y-3.5">
                    {activeProject?.customFieldDefs?.length === 0 ? (
                      <p className="text-[10px] text-slate-500 italic">Belum ada field kustom.</p>
                    ) : (
                      activeProject?.customFieldDefs?.map((def) => {
                        const taskVal = selectedTask.customFieldValues?.find(val => val.fieldId === def.id)?.value || "";
                        
                        return (
                          <div key={def.id} className="space-y-1 bg-slate-900/20 p-2.5 rounded-xl border border-slate-900">
                            <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">{def.name}</span>
                            {def.type === "DROPDOWN" ? (
                              <select
                                value={taskVal}
                                onChange={(e) => handleUpdateCustomFieldVal(def.id, e.target.value)}
                                className="glass-input w-full px-2 py-1 rounded-lg text-xs bg-transparent border border-slate-850"
                              >
                                <option value="" className="bg-[#0c1324] text-slate-500">- Pilih Opsi -</option>
                                {def.options?.split(",").map(opt => (
                                  <option key={opt} value={opt} className="bg-[#0c1324] text-slate-200">{opt}</option>
                                ))}
                              </select>
                            ) : def.type === "NUMBER" ? (
                              <input 
                                type="number"
                                value={taskVal}
                                onChange={(e) => handleUpdateCustomFieldVal(def.id, e.target.value)}
                                className="glass-input w-full px-2 py-1 rounded-lg text-xs"
                                placeholder="Masukkan angka..."
                              />
                            ) : (
                              <input 
                                type="text"
                                value={taskVal}
                                onBlur={(e) => handleUpdateCustomFieldVal(def.id, e.target.value)}
                                onChange={(e) => {
                                  // Update task local reference to show characters instant
                                  const updatedVals = selectedTask.customFieldValues?.map(cv => 
                                    cv.fieldId === def.id ? { ...cv, value: e.target.value } : cv
                                  ) || [];
                                  if (!updatedVals.some(cv => cv.fieldId === def.id)) {
                                    updatedVals.push({ fieldId: def.id, value: e.target.value } as any);
                                  }
                                  setSelectedTask({ ...selectedTask, customFieldValues: updatedVals });
                                }}
                                className="glass-input w-full px-2 py-1 rounded-lg text-xs"
                                placeholder="Masukkan teks..."
                              />
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                <hr className="border-slate-800/40" />

                {/* Invite Collaborator Section */}
                <div className="space-y-3">
                  <h4 className="font-extrabold text-sm text-slate-200">Kolaborator Board</h4>
                  <div className="space-y-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={12} />
                      <input 
                        type="text"
                        placeholder="Ketik username untuk menambah kolaborator..."
                        value={collabQuery}
                        onChange={(e) => setCollabQuery(e.target.value)}
                        className="glass-input pl-8 pr-3 py-1.5 rounded-xl text-xs w-full font-medium"
                      />
                    </div>

                    {collabSearchError && (
                      <span className="text-[10px] text-red-400 font-bold block">{collabSearchError}</span>
                    )}

                    {/* Search Results list */}
                    {collabSearchResults.length > 0 && (
                      <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                        {collabSearchResults.map(user => (
                          <div key={user.id} className="flex justify-between items-center p-1.5 hover:bg-slate-850 rounded-lg">
                            <div className="flex items-center space-x-2">
                              <img 
                                src={user.profile?.avatarUrl || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user.id}`}
                                className="w-5 h-5 rounded-full"
                              />
                              <span className="text-xs text-slate-300 font-bold">@{user.username}</span>
                            </div>
                            <button 
                              onClick={() => handleInviteCollaborator(user.username)}
                              className="px-2 py-1 bg-[#0085FF] hover:bg-blue-600 rounded-md text-[9px] font-bold text-white transition-all cursor-pointer flex items-center space-x-1"
                            >
                              <UserPlus size={10} />
                              <span>Undang</span>
                            </button>
                          </div>
                        ))}
                      </div>
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
                            refreshSelectedTask();
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
                      disabled={aiThinking || user?.plan !== "PRO"}
                      className="flex-1 py-1.5 rounded-lg bg-[#0085FF]/10 border border-[#0085FF]/20 hover:bg-[#0085FF]/20 text-[#0085FF] font-bold text-[10px] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1"
                    >
                      {user?.plan !== "PRO" && <Lock size={10} className="text-[#0085FF]" />}
                      <span>Pecah Subtugas</span>
                    </button>
                    <button 
                      onClick={() => triggerAiAction("estimate")}
                      disabled={aiThinking || user?.plan !== "PRO"}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold text-[10px] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1"
                    >
                      {user?.plan !== "PRO" && <Lock size={10} className="text-slate-400" />}
                      <span>Estimasi Jam</span>
                    </button>
                    <button 
                      onClick={() => triggerAiAction("prioritize")}
                      disabled={aiThinking || user?.plan !== "PRO"}
                      className="flex-1 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700 hover:bg-slate-700 text-slate-300 font-bold text-[10px] transition-all cursor-pointer disabled:opacity-50 flex items-center justify-center space-x-1"
                    >
                      {user?.plan !== "PRO" && <Lock size={10} className="text-slate-400" />}
                      <span>Prioritas</span>
                    </button>
                  </div>

                  {user?.plan !== "PRO" ? (
                    <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-slate-300 space-y-2.5 font-sans">
                      <div className="flex items-center space-x-2 text-amber-400 font-bold text-[10px]">
                        <Lock size={12} className="animate-pulse" />
                        <span>FITUR AI EKSKLUSIF PRO</span>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        Upgrade ke plan **PRO** untuk mengaktifkan AI Assistant yang memecah subtugas otomatis, menghitung estimasi pengerjaan, dan memberi rekomendasi prioritas tugas Anda.
                      </p>
                      <Link 
                        href="/payment"
                        className="inline-flex items-center justify-center w-full py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-amber-500 hover:from-yellow-300 hover:to-amber-400 text-slate-950 font-bold text-[10px] transition-all cursor-pointer shadow-md shadow-amber-500/10"
                      >
                        Beralih ke PRO Sekarang
                      </Link>
                    </div>
                  ) : (
                    <>
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
                    </>
                  )}
                </div>

                {/* Save Task Configuration as Template widget */}
                <div className="space-y-2 bg-slate-900/10 p-3.5 rounded-2xl border border-slate-850">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-300">Simpan isi field tugas ini</span>
                    <button 
                      onClick={() => setShowSaveTemplateForm(!showSaveTemplateForm)}
                      className="text-[10px] font-bold text-[#0085FF] hover:underline flex items-center space-x-1"
                    >
                      <Save size={12} />
                      <span>{showSaveTemplateForm ? "Batal" : "Simpan Template"}</span>
                    </button>
                  </div>
                  
                  {showSaveTemplateForm && (
                    <form onSubmit={handleSaveAsTemplate} className="space-y-3.5 pt-2">
                      <input 
                        type="text" 
                        required
                        value={saveTemplateName}
                        onChange={(e) => setSaveTemplateName(e.target.value)}
                        placeholder="Contoh: Desain Template A"
                        className="glass-input w-full px-2.5 py-1.5 rounded-xl text-xs"
                      />
                      <button 
                        type="submit"
                        className="w-full py-2 rounded-xl bg-gradient-to-r from-blue-600 to-[#0085FF] hover:from-blue-700 hover:to-blue-600 font-bold text-xs text-white"
                      >
                        Konfirmasi Simpan
                      </button>
                    </form>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="mt-auto pt-4 flex gap-2">
                  <button 
                    onClick={() => setShowDeleteConfirmModal(true)}
                    className="flex-1 py-2.5 rounded-xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 text-red-400 font-bold text-xs transition-colors cursor-pointer"
                  >
                    Hapus Tugas
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* Create Board Modal */}
        <AnimatePresence>
          {showAddProjectModal && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowAddProjectModal(false)}
                className="fixed inset-0 bg-black/50 z-40"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 m-auto w-[90%] max-w-[400px] h-fit bg-slate-900 border border-slate-800 shadow-2xl p-6 rounded-2xl z-50 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">Buat Board Baru</h3>
                  <button onClick={() => setShowAddProjectModal(false)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleCreateProject} className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Nama Board</label>
                    <input 
                      type="text" 
                      required
                      placeholder="Masukkan nama board baru..." 
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="glass-input w-full px-3 py-2 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Pilih Warna Board</label>
                    <div className="flex gap-2.5 pt-1">
                      {colors.map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setNewProjectColor(c)}
                          className={`w-6 h-6 rounded-full border-2 transition-all ${
                            newProjectColor === c ? "border-white scale-110" : "border-transparent opacity-80"
                          }`}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-2.5 rounded-xl bg-[#0085FF] hover:bg-blue-600 font-bold text-xs shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
                  >
                    Konfirmasi Buat Board
                  </button>
                </form>
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
                className="fixed inset-0 bg-black/50 z-40"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 m-auto w-[90%] max-w-[420px] h-fit bg-slate-900 border border-slate-800 shadow-2xl p-6 rounded-2xl z-50 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h3 className="font-extrabold text-sm text-slate-100 uppercase tracking-wider">Tambah Tugas Baru</h3>
                  <button onClick={() => setShowAddTaskModal(false)} className="text-slate-500 hover:text-slate-300 cursor-pointer">
                    <X size={16} />
                  </button>
                </div>

                <form onSubmit={handleCreateTask} className="space-y-4">
                  {/* Template selector if templates exist */}
                  {projectTemplates.length > 0 && (
                    <div className="space-y-1">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Gunakan Template Tugas</label>
                      <select
                        value={selectedTemplateId}
                        onChange={(e) => {
                          setSelectedTemplateId(e.target.value);
                          if (e.target.value) {
                            const template = taskTemplates.find(t => t.id === e.target.value);
                            if (template) setNewTaskTitle(template.title);
                          } else {
                            setNewTaskTitle("");
                          }
                        }}
                        className="glass-input w-full px-3 py-2 rounded-xl text-xs appearance-none"
                      >
                        <option value="">Tanpa Template (Hanya Judul)</option>
                        {projectTemplates.map(t => (
                          <option key={t.id} value={t.id}>{t.name}</option>
                        ))}
                      </select>
                    </div>
                  )}

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

                  {/* Show full configuration only if selecting template or if user wants to build config */}
                  {selectedTemplateId === "" && projectTemplates.length > 0 ? (
                    // Simple title-only view as requested
                    <p className="text-[10px] text-slate-500 italic">
                      *Tampilan ringkas aktif. Konfigurasi tanggal, custom field, dan member dapat dilakukan di panel detail tugas setelah dibuat.
                    </p>
                  ) : (
                    // Regular full detail view when templates are loaded or if it's the default create task
                    <>
                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Kolom / Tahapan</label>
                        <select
                          value={newTaskSection}
                          onChange={(e) => setNewTaskSection(e.target.value)}
                          className="glass-input w-full px-3 py-2 rounded-xl text-xs appearance-none"
                        >
                          {projectSections.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Tenggat Waktu</label>
                        <div className="relative">
                          <input 
                            type="date" 
                            value={newTaskDueDate}
                            onChange={(e) => setNewTaskDueDate(e.target.value)}
                            className="glass-input w-full pl-3 pr-10 py-2 rounded-xl text-xs cursor-pointer custom-date-input"
                          />
                          <CalendarIcon className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" size={14} />
                        </div>
                      </div>
                    </>
                  )}

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

        {/* Custom Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirmModal && selectedTask && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.5 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowDeleteConfirmModal(false)}
                className="fixed inset-0 bg-black/60 z-[60]"
              />

              <motion.div 
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-0 m-auto w-[90%] max-w-[380px] h-fit bg-slate-900 border border-slate-800 shadow-2xl p-6 rounded-2xl z-[70] space-y-4"
              >
                <div className="flex items-center space-x-3 text-red-500">
                  <AlertTriangle size={20} className="shrink-0" />
                  <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-100">Hapus Tugas?</h3>
                </div>

                <p className="text-xs text-slate-400 leading-relaxed">
                  Apakah Anda yakin ingin menghapus tugas <strong className="text-slate-200">"{selectedTask.title}"</strong>? Tindakan ini akan menghapus tugas secara permanen dari sistem.
                </p>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setShowDeleteConfirmModal(false)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 font-bold text-xs text-slate-300 transition-colors cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    onClick={async () => {
                      await deleteTask(selectedTask.id);
                      setSelectedTask(null);
                      setShowDeleteConfirmModal(false);
                    }}
                    className="flex-1 py-2 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-xs text-white shadow-lg shadow-red-500/20 transition-all cursor-pointer"
                  >
                    Ya, Hapus
                  </button>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </AppLayout>
  );
}
