import { PrismaClient } from "@prisma/client";
import crypto from "crypto";

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

async function main() {
  console.log("Connecting to database...");
  const prisma = new PrismaClient();

  console.log("Seeding database...");

  // 1. Clear existing data
  await prisma.userReward.deleteMany({});
  await prisma.rewardItem.deleteMany({});
  await prisma.leaderboardEntry.deleteMany({});
  await prisma.elphPet.deleteMany({});
  await prisma.userAchievement.deleteMany({});
  await prisma.achievement.deleteMany({});
  await prisma.streak.deleteMany({});
  await prisma.userXP.deleteMany({});
  await prisma.xPRule.deleteMany({});
  await prisma.timeEntry.deleteMany({});
  await prisma.subtask.deleteMany({});
  await prisma.taskDependency.deleteMany({});
  await prisma.taskLabel.deleteMany({});
  await prisma.label.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.section.deleteMany({});
  await prisma.sprint.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.workspaceMember.deleteMany({});
  await prisma.workspace.deleteMany({});
  await prisma.profile.deleteMany({});
  await prisma.oAuthAccount.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("Cleaned up old tables.");

  // 2. Create users
  const user = await prisma.user.create({
    data: {
      id: "usr_test",
      username: "artha_gp",
      email: "arthagusfi8@gmail.com",
      passwordHash: hashPassword("Zunos123@"),
      phone: "083848762736",
      plan: "PRO",
      isVerified: true,
    },
  });

  const member1 = await prisma.user.create({
    data: { id: "usr_member1", username: "pachy", email: "pachy@elphex.com" },
  });

  const member2 = await prisma.user.create({
    data: { id: "usr_member2", username: "jumbo", email: "jumbo@elphex.com" },
  });

  // 3. Create Profile
  await prisma.profile.create({
    data: {
      userId: user.id,
      name: "Artha GP",
      avatarUrl: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=arthur",
      bio: "Gamer, builder, productivity seeker. Elephant never forgets!",
      timezone: "Asia/Jakarta",
    },
  });

  await prisma.profile.create({
    data: {
      userId: member1.id,
      name: "PachydermPro",
      avatarUrl: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=pachy",
      bio: "Keep moving forward.",
    },
  });

  await prisma.profile.create({
    data: {
      userId: member2.id,
      name: "JumboPlanner",
      avatarUrl: "https://api.dicebear.com/7.x/fun-emoji/svg?seed=jumbo",
      bio: "Planning is the key to success.",
    },
  });

  // ==========================================
  // 4. WORKSPACE 1: PERSONAL WORKSPACE
  // ==========================================
  console.log("Creating Personal Workspace...");
  const personalWorkspace = await prisma.workspace.create({
    data: {
      id: "wsp_personal",
      name: "Personal Workspace",
      slug: "personal-space",
      ownerId: user.id,
      plan: "FREE",
    },
  });

  await prisma.workspaceMember.create({
    data: { workspaceId: personalWorkspace.id, userId: user.id, role: "OWNER" },
  });

  // Personal Labels
  const lblSelfCare = await prisma.label.create({
    data: { id: "lbl_p_selfcare", workspaceId: personalWorkspace.id, name: "Self-Care", color: "#216e4e" },
  });

  const lblErrand = await prisma.label.create({
    data: { id: "lbl_p_errand", workspaceId: personalWorkspace.id, name: "Belanja", color: "#7f5f01" },
  });

  // Personal Project
  const personalProject = await prisma.project.create({
    data: {
      id: "prj_personal",
      workspaceId: personalWorkspace.id,
      name: "🏠 Personal Tasks",
      color: "#10B981",
      createdBy: user.id,
    },
  });

  // Personal Sections (Custom board columns for personal tasks)
  const secPTodo = await prisma.section.create({
    data: { id: "sec_p_todo", projectId: personalProject.id, name: "To Do", position: 1.0 },
  });

  const secPDoing = await prisma.section.create({
    data: { id: "sec_p_doing", projectId: personalProject.id, name: "In Progress", position: 2.0 },
  });

  const secPDone = await prisma.section.create({
    data: { id: "sec_p_done", projectId: personalProject.id, name: "Completed", position: 3.0 },
  });

  // Personal Tasks
  await prisma.task.create({
    data: {
      id: "tsk_p1",
      title: "Beli bahan makanan & kebutuhan mingguan",
      description: "Belanja sayur, buah, dan susu di supermarket terdekat.",
      status: "TODO",
      priority: "LOW",
      projectId: personalProject.id,
      sectionId: secPTodo.id,
      createdBy: user.id,
      position: 1.0,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    },
  });

  await prisma.task.create({
    data: {
      id: "tsk_p2",
      title: "Olahraga pagi - Jogging 5 km",
      description: "Jogging keliling kompleks perumahan untuk stamina.",
      status: "DONE",
      priority: "MEDIUM",
      projectId: personalProject.id,
      sectionId: secPDone.id,
      createdBy: user.id,
      position: 2.0,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
  });

  await prisma.task.create({
    data: {
      id: "tsk_p3",
      title: "Membaca buku 'Atomic Habits' 15 halaman",
      description: "Fokus membaca untuk pengembangan kebiasaan baik.",
      status: "IN_PROGRESS",
      priority: "LOW",
      projectId: personalProject.id,
      sectionId: secPDoing.id,
      createdBy: user.id,
      position: 3.0,
      dueDate: new Date(), // Today
    },
  });

  // Connect Personal Task Labels
  await prisma.taskLabel.createMany({
    data: [
      { taskId: "tsk_p1", labelId: lblErrand.id },
      { taskId: "tsk_p2", labelId: lblSelfCare.id },
      { taskId: "tsk_p3", labelId: lblSelfCare.id },
    ],
  });


  // ==========================================
  // 5. WORKSPACE 2: ORGANIZATION / TEAM WORKSPACE
  // ==========================================
  console.log("Creating Organization / Team Workspace...");
  const teamWorkspace = await prisma.workspace.create({
    data: {
      id: "wsp_org_alpha",
      name: "Alpha Organization",
      slug: "alpha-org",
      ownerId: user.id,
      plan: "PRO",
    },
  });

  // Team Members
  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: teamWorkspace.id, userId: user.id, role: "OWNER" },
      { workspaceId: teamWorkspace.id, userId: member1.id, role: "ADMIN" },
      { workspaceId: teamWorkspace.id, userId: member2.id, role: "MEMBER" },
    ],
  });

  // Organization Labels
  const lblFeature = await prisma.label.create({
    data: { id: "lbl_feature", workspaceId: teamWorkspace.id, name: "Fitur Utama", color: "#0c66e4" },
  });

  const lblBug = await prisma.label.create({
    data: { id: "lbl_bug", workspaceId: teamWorkspace.id, name: "Bug S1", color: "#ae2e24" },
  });

  const lblEnhancement = await prisma.label.create({
    data: { id: "lbl_enhancement", workspaceId: teamWorkspace.id, name: "Peningkatan", color: "#216e4e" },
  });

  const lblDoc = await prisma.label.create({
    data: { id: "lbl_doc", workspaceId: teamWorkspace.id, name: "Dokumentasi", color: "#a54800" },
  });

  // Team Project
  const teamProject = await prisma.project.create({
    data: {
      id: "prj_core",
      workspaceId: teamWorkspace.id,
      name: "🚀 Elphex Launch Sprint",
      color: "#0085FF",
      createdBy: user.id,
    },
  });

  // Team Sections (Customized board columns for organization tasks)
  const secTodo = await prisma.section.create({
    data: { id: "sec_todo", projectId: teamProject.id, name: "To Do", position: 1.0 },
  });

  const secDoing = await prisma.section.create({
    data: { id: "sec_doing", projectId: teamProject.id, name: "In Progress", position: 2.0 },
  });

  const secReview = await prisma.section.create({
    data: { id: "sec_review", projectId: teamProject.id, name: "Ulasan / Uji", position: 3.0 },
  });

  const secDone = await prisma.section.create({
    data: { id: "sec_done", projectId: teamProject.id, name: "Completed", position: 4.0 },
  });

  // Team Tasks
  await prisma.task.create({
    data: {
      id: "tsk_1",
      title: "Initialize Next.js 15 & Setup Tailwind v4 CSS",
      description: "Setup folder structure, global glassmorphism colors, and base elements.",
      status: "DONE",
      priority: "HIGH",
      projectId: teamProject.id,
      sectionId: secDone.id,
      createdBy: user.id,
      position: 1.0,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
  });

  await prisma.task.create({
    data: {
      id: "tsk_2",
      title: "Implement Core Prisma Schema for SQLite",
      description: "Define entities for Tasks, Sprints, Subtasks, XP rules, and Elph Pets.",
      status: "DONE",
      priority: "URGENT",
      projectId: teamProject.id,
      sectionId: secDone.id,
      createdBy: user.id,
      position: 2.0,
      dueDate: new Date(), // Today
    },
  });

  await prisma.task.create({
    data: {
      id: "tsk_3",
      title: "Build Zustand Store & UI Navigation Layout",
      description: "Create state management for level tracking, Pet feeding, and Pomodoro focus sessions.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      projectId: teamProject.id,
      sectionId: secDoing.id,
      createdBy: user.id,
      position: 3.0,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    },
  });

  await prisma.task.create({
    data: {
      id: "tsk_4",
      title: "Integrate Vercel AI SDK 'Elephant Brain'",
      description: "Develop subtask decomposition assistant. Add fallbacks for local mock service.",
      status: "TODO",
      priority: "MEDIUM",
      projectId: teamProject.id,
      sectionId: secTodo.id,
      createdBy: user.id,
      position: 4.0,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.task.create({
    data: {
      id: "tsk_5",
      title: "Deploy app to Vercel Hosting & Configure Sentry",
      description: "Setup continuous integration with GitHub actions and monitoring tools.",
      status: "TODO",
      priority: "LOW",
      projectId: teamProject.id,
      sectionId: secTodo.id,
      createdBy: user.id,
      position: 5.0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // Connect Team Task Labels
  await prisma.taskLabel.createMany({
    data: [
      { taskId: "tsk_1", labelId: lblFeature.id },
      { taskId: "tsk_2", labelId: lblBug.id },
      { taskId: "tsk_3", labelId: lblFeature.id },
      { taskId: "tsk_4", labelId: lblFeature.id },
    ],
  });

  // 9. Add Subtasks (for Team Tasks)
  await prisma.subtask.createMany({
    data: [
      { taskId: "tsk_3", title: "Write elphexStore.ts logic", isDone: true, position: 1.0 },
      { taskId: "tsk_3", title: "Create glassmorphic Sidebar widget", isDone: false, position: 2.0 },
      { taskId: "tsk_3", title: "Setup page layout and router paths", isDone: false, position: 3.0 },
      { taskId: "tsk_4", title: "Setup API routes for AI", isDone: false, position: 1.0 },
      { taskId: "tsk_4", title: "Create front-end prompts and breakdown widget", isDone: false, position: 2.0 },
    ],
  });

  // 10. Add Dependencies (Task 3 depends on Task 2)
  await prisma.taskDependency.create({
    data: {
      taskId: "tsk_3",
      dependsOnTaskId: "tsk_2",
      type: "BLOCKED_BY",
    },
  });

  // 11. Add XP Rules
  await prisma.xPRule.createMany({
    data: [
      { eventType: "TASK_COMPLETE", xpAmount: 50 },
      { eventType: "DEADLINE_ON_TIME", xpAmount: 25 },
      { eventType: "FOCUS_COMPLETED", xpAmount: 100 },
      { eventType: "FEED_PET", xpAmount: 15 },
    ],
  });

  // 12. Add Streaks & XP & Pet for testing
  await prisma.userXP.create({
    data: {
      userId: user.id,
      totalXp: 555,
      level: 4,
    },
  });

  await prisma.streak.create({
    data: {
      userId: user.id,
      currentStreak: 5,
      longestStreak: 12,
      lastActivityDate: new Date(),
    },
  });

  await prisma.elphPet.create({
    data: {
      userId: user.id,
      name: "Elphy",
      level: 3,
      mood: "HAPPY",
      color: "GREY",
    },
  });

  // 13. Achievements
  const ach1 = await prisma.achievement.create({
    data: { name: "First Steps", description: "Completed your first task!", icon: "🌱", conditionType: "TASKS_COMPLETED", conditionValue: 1 },
  });
  const ach2 = await prisma.achievement.create({
    data: { name: "Night Owl", description: "Completed a task between 12 AM and 4 AM", icon: "🦉", conditionType: "SPECIAL", conditionValue: 0 },
  });
  const ach3 = await prisma.achievement.create({
    data: { name: "Focus Novice", description: "Completed your first Pomodoro session", icon: "⏱️", conditionType: "FOCUS_HOURS", conditionValue: 1 },
  });
  const ach4 = await prisma.achievement.create({
    data: { name: "Elder Herd Leader", description: "Reached Level 25!", icon: "👑", conditionType: "LEVEL_REACHED", conditionValue: 25 },
  });

  // Unlock 'First Steps' achievement for main user
  await prisma.userAchievement.create({
    data: {
      userId: user.id,
      achievementId: ach1.id,
    },
  });

  // 14. Reward Items
  await prisma.rewardItem.createMany({
    data: [
      { id: "rwd_theme_cyan", name: "Cyber Neon Cyan UI Theme", type: "UI_THEME", xpCost: 150 },
      { id: "rwd_theme_purple", name: "Cosmic Dark Purple UI Theme", type: "UI_THEME", xpCost: 200 },
      { id: "rwd_frame_gold", name: "Crown Jewel Avatar Frame", type: "AVATAR_FRAME", xpCost: 350 },
      { id: "rwd_pet_blue", name: "Elph Pet Blue Skin", type: "PET_COLOR", xpCost: 250 },
      { id: "rwd_pet_gold", name: "Elph Pet Royal Gold Skin", type: "PET_COLOR", xpCost: 500, isExclusive: true },
      { id: "rwd_badge_pioneer", name: "Beta Pioneer Profile Badge", type: "BADGE", xpCost: 100 },
    ],
  });

  // Buy a starting item
  await prisma.userReward.create({
    data: {
      userId: user.id,
      rewardId: "rwd_badge_pioneer",
    },
  });

  // 15. Leaderboard Entries (Linked to the Team Organization workspace)
  await prisma.leaderboardEntry.createMany({
    data: [
      { workspaceId: teamWorkspace.id, userId: user.id, period: "WEEKLY", xp: 450, rank: 2 },
      { workspaceId: teamWorkspace.id, userId: member1.id, period: "WEEKLY", xp: 620, rank: 1 },
      { workspaceId: teamWorkspace.id, userId: member2.id, period: "WEEKLY", xp: 210, rank: 3 },
    ],
  });

  // 16. Sprint (Linked to the Team Project)
  await prisma.sprint.create({
    data: {
      id: "spr_1",
      projectId: teamProject.id,
      name: "Sprint 1: Core System & Gamification Engine",
      startDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Started 2 days ago
      endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Ends in 5 days
      status: "ACTIVE",
    },
  });

  // 17. Time Entries
  await prisma.timeEntry.createMany({
    data: [
      { taskId: "tsk_1", userId: user.id, durationMinutes: 45, startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000), type: "MANUAL" },
      { taskId: "tsk_2", userId: user.id, durationMinutes: 25, startedAt: new Date(), type: "FOCUS" },
    ],
  });

  console.log("Seeding completed successfully!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
