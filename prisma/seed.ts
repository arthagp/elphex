import { PrismaClient } from "@prisma/client";

async function main() {
  console.log("Connecting to PostgreSQL database...");
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
      email: "gamer@elphex.com",
    },
  });

  const member1 = await prisma.user.create({
    data: { id: "usr_member1", email: "pachy@elphex.com" },
  });

  const member2 = await prisma.user.create({
    data: { id: "usr_member2", email: "jumbo@elphex.com" },
  });

  // 3. Create Profile
  await prisma.profile.create({
    data: {
      userId: user.id,
      name: "Arthur Pachyderm",
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

  // 4. Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      id: "wsp_personal",
      name: "Alpha Team Workspace",
      slug: "alpha-team",
      ownerId: user.id,
      plan: "PRO",
    },
  });

  // 5. Create Members
  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace.id, userId: user.id, role: "OWNER" },
      { workspaceId: workspace.id, userId: member1.id, role: "ADMIN" },
      { workspaceId: workspace.id, userId: member2.id, role: "MEMBER" },
    ],
  });

  // 6. Create Project
  const project = await prisma.project.create({
    data: {
      id: "prj_core",
      workspaceId: workspace.id,
      name: "🚀 Elphex Launch Sprint",
      color: "#0085FF",
      createdBy: user.id,
    },
  });

  // 7. Create Sections
  const secTodo = await prisma.section.create({
    data: { id: "sec_todo", projectId: project.id, name: "To Do", position: 1.0 },
  });

  const secDoing = await prisma.section.create({
    data: { id: "sec_doing", projectId: project.id, name: "In Progress", position: 2.0 },
  });

  const secDone = await prisma.section.create({
    data: { id: "sec_done", projectId: project.id, name: "Completed", position: 3.0 },
  });

  // 8. Create Tasks
  const task1 = await prisma.task.create({
    data: {
      id: "tsk_1",
      title: "Initialize Next.js 15 & Setup Tailwind v4 CSS",
      description: "Setup folder structure, global glassmorphism colors, and base elements.",
      status: "DONE",
      priority: "HIGH",
      projectId: project.id,
      sectionId: secDone.id,
      createdBy: user.id,
      position: 1.0,
      dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000), // Yesterday
    },
  });

  const task2 = await prisma.task.create({
    data: {
      id: "tsk_2",
      title: "Implement Core Prisma Schema for SQLite",
      description: "Define entities for Tasks, Sprints, Subtasks, XP rules, and Elph Pets.",
      status: "DONE",
      priority: "URGENT",
      projectId: project.id,
      sectionId: secDone.id,
      createdBy: user.id,
      position: 2.0,
      dueDate: new Date(), // Today
    },
  });

  const task3 = await prisma.task.create({
    data: {
      id: "tsk_3",
      title: "Build Zustand Store & UI Navigation Layout",
      description: "Create state management for level tracking, Pet feeding, and Pomodoro focus sessions.",
      status: "IN_PROGRESS",
      priority: "HIGH",
      projectId: project.id,
      sectionId: secDoing.id,
      createdBy: user.id,
      position: 3.0,
      dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
    },
  });

  const task4 = await prisma.task.create({
    data: {
      id: "tsk_4",
      title: "Integrate Vercel AI SDK 'Elephant Brain'",
      description: "Develop subtask decomposition assistant. Add fallbacks for local mock service.",
      status: "TODO",
      priority: "MEDIUM",
      projectId: project.id,
      sectionId: secTodo.id,
      createdBy: user.id,
      position: 4.0,
      dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    },
  });

  const task5 = await prisma.task.create({
    data: {
      id: "tsk_5",
      title: "Deploy app to Vercel Hosting & Configure Sentry",
      description: "Setup continuous integration with GitHub actions and monitoring tools.",
      status: "TODO",
      priority: "LOW",
      projectId: project.id,
      sectionId: secTodo.id,
      createdBy: user.id,
      position: 5.0,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  // 9. Add Subtasks
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
      totalXp: 450,
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
      level: 2,
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

  // 15. Leaderboard Entries
  await prisma.leaderboardEntry.createMany({
    data: [
      { workspaceId: workspace.id, userId: user.id, period: "WEEKLY", xp: 450, rank: 2 },
      { workspaceId: workspace.id, userId: member1.id, period: "WEEKLY", xp: 620, rank: 1 },
      { workspaceId: workspace.id, userId: member2.id, period: "WEEKLY", xp: 210, rank: 3 },
    ],
  });

  // 16. Sprint
  await prisma.sprint.create({
    data: {
      id: "spr_1",
      projectId: project.id,
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
