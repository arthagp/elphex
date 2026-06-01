import { create } from "zustand";

export interface UserProfile {
  id: string;
  email: string;
  phone: string | null;
  plan: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  level: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
  username: string; // Added field
}

export interface ElphPetState {
  name: string;
  level: number;
  mood: string; // HAPPY, SLEEPY, FOCUSED, HUNGRY, EXCITED
  color: string; // GREY, BLUE, GOLD, COSMIC
  lastFedAt: string;
}

export interface Subtask {
  id: string;
  taskId: string;
  title: string;
  isDone: boolean;
  position: number;
}

export interface Label {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
}

export interface WorkspaceMember {
  workspaceId: string;
  userId: string;
  role: string;
  name: string;
  avatarUrl: string;
}

export interface TaskAssignee {
  userId: string;
  user: {
    id: string;
    email: string;
    profile: {
      name: string;
      avatarUrl: string | null;
    } | null;
  };
}

export interface CustomFieldDefinition {
  id: string;
  projectId: string;
  name: string;
  type: string; // TEXT, NUMBER, DROPDOWN
  options: string | null;
}

export interface TaskCustomFieldValue {
  id: string;
  taskId: string;
  fieldId: string;
  value: string;
  field: CustomFieldDefinition;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string; // TODO, IN_PROGRESS, REVIEW, DONE
  priority: string; // LOW, MEDIUM, HIGH, URGENT
  startDate: string | null; // Added field
  dueDate: string | null;
  dueDateReminder: string; // Added field
  projectId: string;
  sectionId: string;
  position: number;
  subtasks: Subtask[];
  labels: { label: Label }[];
  dependencies: { dependsOnTaskId: string; type: string }[];
  assignees: TaskAssignee[];
  customFieldValues: TaskCustomFieldValue[]; // Added field
  calendarType: string;
}

export interface Project {
  id: string;
  workspaceId: string;
  name: string;
  color: string;
  isArchived: boolean;
  customFieldDefs?: CustomFieldDefinition[]; // Added field
}

export interface Workspace {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  plan: string;
}

export interface Section {
  id: string;
  projectId: string;
  name: string;
  position: number;
}

export interface Sprint {
  id: string;
  projectId: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
  workspaceId: string;
  userName: string;
  userAvatar: string;
  xp: number;
  rank: number;
  streak: number;
}

export interface RewardItem {
  id: string;
  name: string;
  type: string; // UI_THEME, AVATAR_FRAME, PET_COLOR, BADGE
  xpCost: number;
  isExclusive: boolean;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlockedAt: string | null;
}

export interface TaskTemplate {
  id: string;
  name: string;
  projectId: string;
  title: string;
  description: string | null;
  priority: string;
  labels: string | null;
  assigneeId: string | null;
  customFields: string | null;
}

export interface BoardInvitation {
  id: string;
  projectId: string;
  inviteeId: string;
  inviterId: string;
  status: string;
  project: Project;
  inviter: {
    id: string;
    profile: {
      name: string;
      avatarUrl: string | null;
    } | null;
  };
}

export interface PomodoroState {
  isRunning: boolean;
  timeRemaining: number; // in seconds
  type: "focus" | "shortBreak" | "longBreak";
  totalDuration: number; // in seconds
  activeTaskId: string | null;
  ambientSound: string; // NONE, RAIN, FOREST, CAFE
}

export interface XpNotification {
  show: boolean;
  amount: number;
  message: string;
  isLevelUp?: boolean;
}

interface ElphexStore {
  // State
  user: UserProfile | null;
  pet: ElphPetState | null;
  tasks: Task[];
  projects: Project[];
  sections: Section[];
  activeSprint: Sprint | null;
  leaderboard: LeaderboardEntry[];
  rewardItems: RewardItem[];
  purchasedRewards: string[]; // list of rewardIds
  achievements: Achievement[];
  pomodoro: PomodoroState;
  xpNotification: XpNotification;
  workspaces: Workspace[];
  members: WorkspaceMember[];
  activeWorkspaceId: string | null;
  activeProjectId: string | null;
  activeView: "kanban" | "list" | "timeline" | "calendar" | "table";
  isLoading: boolean;
  theme: "light" | "dark";
  taskTemplates: TaskTemplate[]; // Added state
  invitations: BoardInvitation[]; // Added state
  labels: Label[]; // Added state

  // Actions
  fetchInitialData: () => Promise<void>;
  addTask: (title: string, projectId: string, sectionId: string, options?: Partial<Task> & { assigneeId?: string; customFieldValues?: { fieldId: string; value: string }[] }) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Omit<Task, 'labels'>> & { assigneeId?: string | null; labels?: string[] }) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskStatus: (taskId: string) => Promise<void>;
  
  addSubtask: (taskId: string, title: string) => Promise<void>;
  toggleSubtask: (subtaskId: string, isDone: boolean) => Promise<void>;
  deleteSubtask: (subtaskId: string) => Promise<void>;

  feedPet: (foodType: string) => Promise<void>;
  playWithPet: () => Promise<void>;

  startPomodoro: (taskId: string | null, type: "focus" | "shortBreak" | "longBreak") => void;
  pausePomodoro: () => void;
  tickPomodoro: () => void;
  resetPomodoro: () => void;
  changeAmbientSound: (sound: string) => void;

  purchaseReward: (rewardId: string) => Promise<boolean>;
  setActiveWorkspaceId: (workspaceId: string | null) => void;
  setActiveProjectId: (projectId: string | null) => void;
  setActiveView: (view: ElphexStore["activeView"]) => void;
  hideXpNotification: () => void;
  toggleTheme: () => void;
  moveTaskStatus: (taskId: string, targetStatus: string) => Promise<void>;
  showXpGain: (amount: number, message: string, isLevelUp?: boolean) => void;
  logout: () => Promise<void>;
  updateUserPlan: (plan: string) => void;
  addWorkspace: (name: string) => Promise<void>;

  // Added Actions
  addProject: (name: string, color: string, workspaceId: string) => Promise<void>;
  addSection: (name: string, projectId: string) => Promise<void>;
  addCustomFieldDef: (name: string, type: string, options: string | null, projectId: string) => Promise<void>;
  addTaskTemplate: (name: string, projectId: string, taskData: any) => Promise<void>;
  inviteMemberToBoard: (username: string, projectId: string) => Promise<{ success: boolean; error?: string }>;
  respondToInvitation: (invitationId: string, action: "ACCEPT" | "DECLINE") => Promise<void>;
  addLabel: (name: string, color: string, workspaceId: string) => Promise<void>;
  updateLabel: (id: string, name: string, color: string) => Promise<void>;
  deleteLabel: (id: string) => Promise<void>;
}

export const useElphexStore = create<ElphexStore>((set, get) => ({
  // Default values to render UI instantly while loading
  user: null,
  pet: null,
  tasks: [],
  projects: [],
  sections: [],
  activeSprint: null,
  leaderboard: [],
  rewardItems: [],
  purchasedRewards: [],
  achievements: [],
  isLoading: true,
  workspaces: [],
  members: [],
  activeWorkspaceId: null,
  activeProjectId: null,
  activeView: "kanban",
  theme: "dark",
  xpNotification: { show: false, amount: 0, message: "" },
  pomodoro: {
    isRunning: false,
    timeRemaining: 25 * 60,
    type: "focus",
    totalDuration: 25 * 60,
    activeTaskId: null,
    ambientSound: "NONE",
  },
  taskTemplates: [],
  invitations: [],
  labels: [],

  // Actions
  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/init");
      if (res.ok) {
        const data = await res.json();
        const currentActiveWorkspaceId = get().activeWorkspaceId;
        const currentActiveProjectId = get().activeProjectId;
        
        const workspaceExists = data.workspaces.some((w: any) => w.id === currentActiveWorkspaceId);
        const newActiveWorkspaceId = workspaceExists ? currentActiveWorkspaceId : (data.workspaces[0]?.id || null);
        
        const projectExists = data.projects.some((p: any) => p.id === currentActiveProjectId && p.workspaceId === newActiveWorkspaceId);
        const newActiveProjectId = projectExists ? currentActiveProjectId : (data.projects.find((p: any) => p.workspaceId === newActiveWorkspaceId)?.id || null);

        set({
          user: data.user,
          pet: data.pet,
          workspaces: data.workspaces,
          members: data.members,
          activeWorkspaceId: newActiveWorkspaceId,
          tasks: data.tasks,
          projects: data.projects,
          sections: data.sections,
          activeSprint: data.activeSprint,
          leaderboard: data.leaderboard,
          rewardItems: data.rewardItems,
          purchasedRewards: data.purchasedRewards,
          achievements: data.achievements,
          activeProjectId: newActiveProjectId,
          taskTemplates: data.taskTemplates || [],
          invitations: data.invitations || [],
          labels: data.labels || [],
        });
      } else if (res.status === 401 || res.status === 404) {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Failed to fetch initial data", error);
    } finally {
      set({ isLoading: false });
    }
  },

  addTask: async (title, projectId, sectionId, options = {}) => {
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, projectId, sectionId, ...options }),
      });
      if (res.ok) {
        const newTask = await res.json();
        set((state) => ({ tasks: [...state.tasks, newTask] }));
        get().showXpGain(10, "Tugas Baru Ditambahkan!");
      }
    } catch (error) {
      console.error("Error adding task", error);
    }
  },

  updateTask: async (taskId, updates) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        const updated = await res.json();
        set((state) => ({
          tasks: state.tasks.map((t) => (t.id === taskId ? { ...t, ...updated } : t)),
        }));
      }
    } catch (error) {
      console.error("Error updating task", error);
    }
  },

  deleteTask: async (taskId) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== taskId),
        }));
      }
    } catch (error) {
      console.error("Error deleting task", error);
    }
  },

  toggleTaskStatus: async (taskId) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;

    const nextStatus = task.status === "DONE" ? "TODO" : "DONE";
    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (res.ok) {
        const data = await res.json(); // { task, xpGained, levelUp, level }
        set((state) => {
          const updatedTasks = state.tasks.map((t) =>
            t.id === taskId ? { ...t, status: nextStatus } : t
          );
          return {
            tasks: updatedTasks,
            user: state.user
              ? {
                  ...state.user,
                  level: data.level || state.user.level,
                  totalXp: state.user.totalXp + (data.xpGained || 0),
                }
              : null,
            pet: state.pet
              ? {
                  ...state.pet,
                  mood: nextStatus === "DONE" ? "EXCITED" : state.pet.mood,
                }
              : null,
          };
        });

        if (nextStatus === "DONE") {
          get().showXpGain(data.xpGained || 50, "Tugas Selesai!", data.levelUp);
        }
      }
    } catch (error) {
      console.error("Error toggling task status", error);
    }
  },

  addSubtask: async (taskId, title) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}/subtasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title }),
      });
      if (res.ok) {
        const newSub = await res.json();
        set((state) => ({
          tasks: state.tasks.map((t) =>
            t.id === taskId ? { ...t, subtasks: [...t.subtasks, newSub] } : t
          ),
        }));
      }
    } catch (error) {
      console.error("Error adding subtask", error);
    }
  },

  toggleSubtask: async (subtaskId, isDone) => {
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isDone }),
      });
      if (res.ok) {
        const updated = await res.json();
        set((state) => ({
          tasks: state.tasks.map((t) => ({
            ...t,
            subtasks: t.subtasks.map((s) => (s.id === subtaskId ? updated : s)),
          })),
        }));
        if (isDone) {
          get().showXpGain(5, "Subtugas Selesai!");
        }
      }
    } catch (error) {
      console.error("Error toggling subtask", error);
    }
  },

  deleteSubtask: async (subtaskId) => {
    try {
      const res = await fetch(`/api/subtasks/${subtaskId}`, { method: "DELETE" });
      if (res.ok) {
        set((state) => ({
          tasks: state.tasks.map((t) => ({
            ...t,
            subtasks: t.subtasks.filter((s) => s.id !== subtaskId),
          })),
        }));
      }
    } catch (error) {
      console.error("Error deleting subtask", error);
    }
  },

  feedPet: async (foodType) => {
    try {
      const res = await fetch("/api/pet/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ foodType }),
      });
      if (res.ok) {
        const data = await res.json(); // { pet, xpGained }
        set((state) => ({
          pet: data.pet,
          user: state.user
            ? { ...state.user, totalXp: state.user.totalXp + data.xpGained }
            : null,
        }));
        get().showXpGain(data.xpGained, `Kamu memberi makan Elphy ${foodType}!`);
      }
    } catch (error) {
      console.error("Error feeding pet", error);
    }
  },

  playWithPet: async () => {
    try {
      const res = await fetch("/api/pet/play", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        set({ pet: data.pet });
      }
    } catch (error) {
      console.error("Error playing with pet", error);
    }
  },

  startPomodoro: (taskId, type) => {
    let duration = 25 * 60;
    if (type === "shortBreak") duration = 5 * 60;
    if (type === "longBreak") duration = 15 * 60;

    set((state) => ({
      pomodoro: {
        ...state.pomodoro,
        isRunning: true,
        type,
        timeRemaining: duration,
        totalDuration: duration,
        activeTaskId: taskId,
      },
    }));
  },

  pausePomodoro: () => {
    set((state) => ({
      pomodoro: { ...state.pomodoro, isRunning: false },
    }));
  },

  tickPomodoro: () => {
    const { timeRemaining, isRunning } = get().pomodoro;
    if (!isRunning) return;

    if (timeRemaining <= 1) {
      // Completed!
      const type = get().pomodoro.type;
      const activeTaskId = get().pomodoro.activeTaskId;
      
      set((state) => ({
        pomodoro: {
          ...state.pomodoro,
          isRunning: false,
          timeRemaining: 0,
        },
      }));

      // If completed focus session, reward user
      if (type === "focus") {
        fetch("/api/focus/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ taskId: activeTaskId, durationMinutes: Math.round(get().pomodoro.totalDuration / 60) }),
        })
          .then((res) => {
            if (res.ok) return res.json();
          })
          .then((data) => {
            if (data) {
              set((state) => ({
                user: state.user
                  ? { ...state.user, totalXp: state.user.totalXp + data.xpGained, level: data.level || state.user.level }
                  : null,
                pet: state.pet ? { ...state.pet, mood: "FOCUSED" } : null,
              }));
              get().showXpGain(data.xpGained, "Fokus Pomodoro Selesai! (+100 XP)", data.levelUp);
            }
          });
      }
    } else {
      set((state) => ({
        pomodoro: { ...state.pomodoro, timeRemaining: timeRemaining - 1 },
      }));
    }
  },

  resetPomodoro: () => {
    set((state) => {
      let duration = 25 * 60;
      if (state.pomodoro.type === "shortBreak") duration = 5 * 60;
      if (state.pomodoro.type === "longBreak") duration = 15 * 60;

      return {
        pomodoro: {
          ...state.pomodoro,
          isRunning: false,
          timeRemaining: duration,
        },
      };
    });
  },

  changeAmbientSound: (sound) => {
    set((state) => ({
      pomodoro: { ...state.pomodoro, ambientSound: sound },
    }));
  },

  purchaseReward: async (rewardId) => {
    const user = get().user;
    const item = get().rewardItems.find((i) => i.id === rewardId);
    if (!user || !item || user.totalXp < item.xpCost) return false;

    try {
      const res = await fetch("/api/rewards/purchase", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rewardId }),
      });
      if (res.ok) {
        set((state) => ({
          purchasedRewards: [...state.purchasedRewards, rewardId],
          user: state.user
            ? { ...state.user, totalXp: state.user.totalXp - item.xpCost }
            : null,
        }));
        get().showXpGain(-item.xpCost, `Membeli item: ${item.name}`);
        return true;
      }
    } catch (error) {
      console.error("Error purchasing reward", error);
    }
    return false;
  },

  setActiveProjectId: (projectId) => set({ activeProjectId: projectId }),
  setActiveWorkspaceId: (workspaceId) => {
    const state = get();
    const firstProject = state.projects.find((p) => p.workspaceId === workspaceId);
    set({
      activeWorkspaceId: workspaceId,
      activeProjectId: firstProject?.id || null,
    });
  },
  setActiveView: (view) => set({ activeView: view }),

  hideXpNotification: () =>
    set((state) => ({
      xpNotification: { ...state.xpNotification, show: false },
    })),

  toggleTheme: () => {
    const nextTheme = get().theme === "dark" ? "light" : "dark";
    set({ theme: nextTheme });
    if (typeof window !== "undefined") {
      localStorage.setItem("elphex-theme", nextTheme);
      if (nextTheme === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  },

  moveTaskStatus: async (taskId, targetStatus) => {
    const task = get().tasks.find((t) => t.id === taskId);
    if (!task) return;
    if (task.status === targetStatus) return;

    try {
      const res = await fetch(`/api/tasks/${taskId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: targetStatus }),
      });
      if (res.ok) {
        const data = await res.json();
        set((state) => {
          const updatedTasks = state.tasks.map((t) =>
            t.id === taskId ? { ...t, status: targetStatus } : t
          );
          return {
            tasks: updatedTasks,
            user: state.user
              ? {
                  ...state.user,
                  level: data.level || state.user.level,
                  totalXp: state.user.totalXp + (data.xpGained || 0),
                }
              : null,
            pet: state.pet
              ? {
                  ...state.pet,
                  mood: targetStatus === "DONE" ? "EXCITED" : state.pet.mood,
                }
              : null,
          };
        });

        if (targetStatus === "DONE") {
          get().showXpGain(data.xpGained || 50, "Tugas Selesai!", data.levelUp);
        } else {
          get().showXpGain(5, `Tugas dipindahkan ke ${targetStatus}`);
        }
      }
    } catch (error) {
      console.error("Error moving task status", error);
    }
  },
  
  showXpGain: (amount, message, isLevelUp = false) => {
    set({
      xpNotification: { show: true, amount, message, isLevelUp },
    });
    if (isLevelUp) {
      import("canvas-confetti").then((confetti) => {
        confetti.default({
          particleCount: 150,
          spread: 80,
          origin: { y: 0.6 },
        });
      });
    }
  },

  logout: async () => {
    try {
      await fetch("/api/auth/signout", { method: "POST" });
      set({
        user: null,
        pet: null,
        tasks: [],
        projects: [],
        sections: [],
        activeSprint: null,
        leaderboard: [],
        workspaces: [],
        activeWorkspaceId: null,
        activeProjectId: null,
      });
      window.location.href = "/login";
    } catch (e) {
      console.error("Error signing out", e);
    }
  },

  updateUserPlan: (plan: string) => {
    set((state) => ({
      user: state.user ? { ...state.user, plan } : null,
    }));
  },

  addWorkspace: async (name: string) => {
    try {
      const res = await fetch("/api/workspaces", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const newWorkspace = await res.json();
        set((state) => ({
          workspaces: [...state.workspaces, newWorkspace],
          activeWorkspaceId: newWorkspace.id,
        }));
        get().showXpGain(30, "Organisasi Baru Dibuat!");
        // Reload all data so the new projects and sections from the workspace are active
        await get().fetchInitialData();
      }
    } catch (error) {
      console.error("Error creating workspace", error);
    }
  },

  // Added Actions implementations
  addProject: async (name: string, color: string, workspaceId: string) => {
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, workspaceId }),
      });
      if (res.ok) {
        const data = await res.json(); // { project, sections }
        set((state) => ({
          projects: [...state.projects, { ...data.project, customFieldDefs: [] }],
          sections: [...state.sections, ...data.sections],
          activeProjectId: data.project.id,
        }));
        get().showXpGain(20, "Board Baru Berhasil Dibuat!");
      }
    } catch (error) {
      console.error("Error adding project/board", error);
    }
  },

  addSection: async (name: string, projectId: string) => {
    try {
      const res = await fetch("/api/sections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, projectId }),
      });
      if (res.ok) {
        const newSection = await res.json();
        set((state) => ({
          sections: [...state.sections, newSection],
        }));
      }
    } catch (error) {
      console.error("Error adding section", error);
    }
  },

  addCustomFieldDef: async (name: string, type: string, options: string | null, projectId: string) => {
    try {
      const res = await fetch("/api/custom-fields", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, type, options, projectId }),
      });
      if (res.ok) {
        const newDef = await res.json();
        set((state) => ({
          projects: state.projects.map((p) => 
            p.id === projectId 
              ? { ...p, customFieldDefs: [...(p.customFieldDefs || []), newDef] } 
              : p
          ),
        }));
        get().showXpGain(10, "Kustom Field Ditambahkan!");
      }
    } catch (error) {
      console.error("Error adding custom field definition", error);
    }
  },

  addTaskTemplate: async (name: string, projectId: string, taskData: any) => {
    try {
      const res = await fetch("/api/templates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, projectId, ...taskData }),
      });
      if (res.ok) {
        const newTemplate = await res.json();
        set((state) => ({
          taskTemplates: [...state.taskTemplates, newTemplate],
        }));
        get().showXpGain(15, "Template Tugas Disimpan!");
      }
    } catch (error) {
      console.error("Error adding task template", error);
    }
  },

  inviteMemberToBoard: async (username: string, projectId: string) => {
    try {
      const res = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, projectId }),
      });
      const data = await res.json();
      if (res.ok) {
        get().showXpGain(5, `Undangan terkirim ke @${username}!`);
        return { success: true };
      } else {
        return { success: false, error: data.error };
      }
    } catch (error) {
      console.error("Error inviting member to board", error);
      return { success: false, error: "Terjadi kesalahan jaringan" };
    }
  },

  respondToInvitation: async (invitationId: string, action: "ACCEPT" | "DECLINE") => {
    try {
      const res = await fetch(`/api/invitations/${invitationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        // Remove processed invitation
        set((state) => ({
          invitations: state.invitations.filter((i) => i.id !== invitationId),
        }));
        
        if (action === "ACCEPT") {
          get().showXpGain(data.xpGained || 30, "Menerima Undangan Kolaborasi!", data.levelUp);
          // Reload initial data to fetch new workspace, members, projects, etc.
          await get().fetchInitialData();
        } else {
          get().showXpGain(5, "Undangan Ditolak");
        }
      }
    } catch (error) {
      console.error("Error responding to board invitation", error);
    }
  },

  addLabel: async (name: string, color: string, workspaceId: string) => {
    try {
      const res = await fetch("/api/labels", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color, workspaceId }),
      });
      if (res.ok) {
        const newLabel = await res.json();
        set((state) => ({
          labels: [...state.labels, newLabel],
        }));
        get().showXpGain(5, `Label "${name}" dibuat!`);
      }
    } catch (error) {
      console.error("Error adding label", error);
    }
  },

  updateLabel: async (id: string, name: string, color: string) => {
    try {
      const res = await fetch(`/api/labels/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, color }),
      });
      if (res.ok) {
        const updatedLabel = await res.json();
        set((state) => ({
          labels: state.labels.map((l) => (l.id === id ? updatedLabel : l)),
          tasks: state.tasks.map((task) => ({
            ...task,
            labels: task.labels.map((tl) =>
              tl.label.id === id ? { ...tl, label: updatedLabel } : tl
            ),
          })),
        }));
        get().showXpGain(5, "Label berhasil diperbarui!");
      }
    } catch (error) {
      console.error("Error updating label", error);
    }
  },

  deleteLabel: async (id: string) => {
    try {
      const res = await fetch(`/api/labels/${id}`, {
        method: "DELETE",
      });
      if (res.ok) {
        set((state) => ({
          labels: state.labels.filter((l) => l.id !== id),
          tasks: state.tasks.map((task) => ({
            ...task,
            labels: task.labels.filter((tl) => tl.label.id !== id),
          })),
        }));
        get().showXpGain(5, "Label berhasil dihapus!");
      }
    } catch (error) {
      console.error("Error deleting label", error);
    }
  },
}));
