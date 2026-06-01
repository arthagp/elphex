import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("elphex-session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 1. Fetch user & profile
    const userRecord = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!userRecord) {
      const response = NextResponse.json({ error: "User not found" }, { status: 404 });
      response.cookies.delete("elphex-session");
      return response;
    }

    // 2. Fetch XP, Streaks, Pet
    let xpRecord = await prisma.userXP.findUnique({ where: { userId } });
    if (!xpRecord) {
      xpRecord = await prisma.userXP.create({
        data: { userId, totalXp: 0, level: 1 },
      });
    }

    let streakRecord = await prisma.streak.findUnique({ where: { userId } });
    if (!streakRecord) {
      streakRecord = await prisma.streak.create({
        data: { userId, currentStreak: 0, longestStreak: 0 },
      });
    }

    let petRecord = await prisma.elphPet.findUnique({ where: { userId } });
    if (!petRecord) {
      petRecord = await prisma.elphPet.create({
        data: { userId, name: "Elphy", level: 1, mood: "HAPPY", color: "GREY" },
      });
    }

    // 3. Fetch workspaces and projects
    const workspaces = await prisma.workspace.findMany({
      where: { members: { some: { userId } } },
    });

    const workspaceIds = workspaces.map((w) => w.id);

    const workspaceMembers = await prisma.workspaceMember.findMany({
      where: { workspaceId: { in: workspaceIds } },
      include: {
        user: {
          include: {
            profile: true
          }
        }
      }
    });

    const members = workspaceMembers.map((member) => ({
      workspaceId: member.workspaceId,
      userId: member.userId,
      role: member.role,
      name: member.user.profile?.name || "Unknown Ranger",
      avatarUrl: member.user.profile?.avatarUrl || `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${member.userId}`,
    }));

    // Fetch projects with their custom field definitions
    const projects = await prisma.project.findMany({
      where: { workspaceId: { in: workspaceIds }, isArchived: false },
      include: {
        customFieldDefs: true,
      },
    });

    const projectIds = projects.map((p) => p.id);

    // Fetch labels and auto-seed defaults if any workspace has 0 labels
    let labels = await prisma.label.findMany({
      where: { workspaceId: { in: workspaceIds } },
    });

    for (const ws of workspaces) {
      const wsLabels = labels.filter((l) => l.workspaceId === ws.id);
      if (wsLabels.length === 0) {
        const defaults = [
          { name: "Feature", color: "#216e4e" },
          { name: "Bug", color: "#ae2e24" },
          { name: "Urgent", color: "#a54800" },
          { name: "Refactor", color: "#5e4db2" },
          { name: "Design", color: "#7f5f01" },
          { name: "Marketing", color: "#0c66e4" },
        ];
        const created = [];
        for (const item of defaults) {
          const newL = await prisma.label.create({
            data: {
              workspaceId: ws.id,
              name: item.name,
              color: item.color,
            },
          });
          created.push(newL);
        }
        labels = [...labels, ...created];
      }
    }

    // 4. Fetch sections
    const sections = await prisma.section.findMany({
      where: { projectId: { in: projectIds } },
      orderBy: { position: "asc" },
    });

    // 5. Fetch tasks (with subtasks, dependencies, labels, customFieldValues)
    const tasks = await prisma.task.findMany({
      where: {
        projectId: { in: projectIds },
        deletedAt: null,
      },
      include: {
        subtasks: { orderBy: { position: "asc" } },
        labels: { include: { label: true } },
        dependencies: { select: { dependsOnTaskId: true, type: true } },
        customFieldValues: { include: { field: true } },
        assignees: {
          include: {
            user: {
              include: {
                profile: true
              }
            }
          }
        }
      },
      orderBy: { position: "asc" },
    });

    // 6. Fetch Sprints
    const sprints = await prisma.sprint.findMany({
      where: { projectId: { in: projectIds } },
    });
    const activeSprint = sprints.find((s) => s.status === "ACTIVE") || null;

    // 7. Fetch Leaderboard (Weekly)
    const leaderboardRaw = await prisma.leaderboardEntry.findMany({
      where: { workspaceId: { in: workspaceIds }, period: "WEEKLY" },
      include: {
        user: {
          include: {
            profile: true,
            streak: true,
          },
        },
      },
      orderBy: { xp: "desc" },
    });

    const leaderboard = leaderboardRaw.map((entry) => ({
      id: entry.id,
      userId: entry.userId,
      workspaceId: entry.workspaceId,
      userName: entry.user.profile?.name || "Unknown Ranger",
      userAvatar: entry.user.profile?.avatarUrl || "https://api.dicebear.com/7.x/fun-emoji/svg?seed=fallback",
      xp: entry.xp,
      rank: entry.rank,
      streak: entry.user.streak?.currentStreak || 0,
    }));

    // 8. Fetch Reward Items & Purchased rewards
    const rewardItems = await prisma.rewardItem.findMany();
    const purchasedRecords = await prisma.userReward.findMany({
      where: { userId },
    });
    const purchasedRewards = purchasedRecords.map((pr) => pr.rewardId);

    // 9. Fetch Achievements & Unlocked status
    const allAchievements = await prisma.achievement.findMany();
    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId },
    });
    const unlockedIds = new Set(userAchievements.map((ua) => ua.achievementId));

    const achievements = allAchievements.map((ach) => ({
      id: ach.id,
      name: ach.name,
      description: ach.description,
      icon: ach.icon,
      unlockedAt: unlockedIds.has(ach.id)
        ? userAchievements.find((ua) => ua.achievementId === ach.id)?.unlockedAt.toISOString() || null
        : null,
    }));

    // 10. Fetch Task Templates
    const taskTemplates = await prisma.taskTemplate.findMany({
      where: { projectId: { in: projectIds } },
    });

    // 11. Fetch Board/Project Invitations
    const invitations = await prisma.boardInvitation.findMany({
      where: { inviteeId: userId, status: "PENDING" },
      include: {
        project: true,
        inviter: {
          include: {
            profile: true,
          },
        },
      },
    });

    // 12. Assemble User Profile Object
    const userProfile = {
      id: userRecord.id,
      username: userRecord.username,
      email: userRecord.email,
      name: userRecord.profile?.name || "Explorer",
      avatarUrl: userRecord.profile?.avatarUrl || null,
      bio: userRecord.profile?.bio || null,
      level: xpRecord.level,
      totalXp: xpRecord.totalXp,
      currentStreak: streakRecord.currentStreak,
      longestStreak: streakRecord.longestStreak,
      plan: userRecord.plan,
    };

    return NextResponse.json({
      user: userProfile,
      pet: {
        name: petRecord.name,
        level: petRecord.level,
        mood: petRecord.mood,
        color: petRecord.color,
        lastFedAt: petRecord.lastFedAt.toISOString(),
      },
      workspaces,
      members,
      projects,
      sections,
      tasks,
      activeSprint,
      leaderboard,
      rewardItems,
      purchasedRewards,
      achievements,
      taskTemplates,
      invitations,
      labels,
    });
  } catch (error) {
    console.error("API Init Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
