import { create } from "zustand";

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string | null;
  bio: string | null;
  level: number;
  totalXp: number;
  currentStreak: number;
  longestStreak: number;
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
  name: string;
  color: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: string; // TODO, IN_PROGRESS, REVIEW, DONE
  priority: string; // LOW, MEDIUM, HIGH, URGENT
  dueDate: string | null;
  projectId: string;
  sectionId: string;
  position: number;
  subtasks: Subtask[];
  labels: { label: Label }[];
  dependencies: { dependsOnTaskId: string; type: string }[];
}

export interface Project {
  id: string;
  name: string;
  color: string;
  isArchived: boolean;
}

export interface Section {
  id: string;
  projectId: string;
  name: string;
  position: number;
}

export interface Sprint {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: string;
}

export interface LeaderboardEntry {
  id: string;
  userId: string;
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
  activeProjectId: string | null;
  activeView: "kanban" | "list" | "timeline" | "calendar" | "table";
  isLoading: boolean;

  // Actions
  fetchInitialData: () => Promise<void>;
  addTask: (title: string, projectId: string, sectionId: string, options?: Partial<Task>) => Promise<void>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
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
  setActiveProjectId: (projectId: string | null) => void;
  setActiveView: (view: ElphexStore["activeView"]) => void;
  showXpGain: (amount: number, message: string, isLevelUp?: boolean) => void;
  hideXpNotification: () => void;
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
  activeProjectId: null,
  activeView: "kanban",
  xpNotification: { show: false, amount: 0, message: "" },
  pomodoro: {
    isRunning: false,
    timeRemaining: 25 * 60,
    type: "focus",
    totalDuration: 25 * 60,
    activeTaskId: null,
    ambientSound: "NONE",
  },

  // Actions
  fetchInitialData: async () => {
    set({ isLoading: true });
    try {
      const res = await fetch("/api/init");
      if (res.ok) {
        const data = await res.json();
        set({
          user: data.user,
          pet: data.pet,
          tasks: data.tasks,
          projects: data.projects,
          sections: data.sections,
          activeSprint: data.activeSprint,
          leaderboard: data.leaderboard,
          rewardItems: data.rewardItems,
          purchasedRewards: data.purchasedRewards,
          achievements: data.achievements,
          activeProjectId: data.projects[0]?.id || null,
        });
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
  setActiveView: (view) => set({ activeView: view }),

  showXpGain: (amount, message, isLevelUp = false) => {
    set({
      xpNotification: { show: true, amount, message, isLevelUp },
    });
    // Trigger confetti if level up!
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

  hideXpNotification: () =>
    set((state) => ({
      xpNotification: { ...state.xpNotification, show: false },
    })),
}));
