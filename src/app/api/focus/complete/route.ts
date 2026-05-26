import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getLevelFromXp, checkAndUnlockAchievements } from "@/lib/gameEngine";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("elphex-session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { taskId, durationMinutes } = await request.json();

    // 1. Award user 100 XP
    const xpRule = await prisma.xPRule.findUnique({ where: { eventType: "FOCUS_COMPLETED" } });
    const xpAmount = xpRule ? xpRule.xpAmount : 100;

    let userXp = await prisma.userXP.findUnique({ where: { userId } });
    if (!userXp) {
      userXp = await prisma.userXP.create({
        data: { userId, totalXp: 0, level: 1 },
      });
    }

    const previousLevel = userXp.level;
    const newTotalXp = userXp.totalXp + xpAmount;
    const nextUserLevel = getLevelFromXp(newTotalXp);
    const userLevelUp = nextUserLevel > previousLevel;

    // Update user XP
    await prisma.userXP.update({
      where: { userId },
      data: {
        totalXp: newTotalXp,
        level: nextUserLevel,
      },
    });

    // 2. Create time entry
    // If taskId is provided, log it. Otherwise we can link to a default placeholder or create a task
    let targetTaskId = taskId;
    if (!targetTaskId) {
      // Find or create a dummy task for focus log if none is selected
      const firstTask = await prisma.task.findFirst({ where: { deletedAt: null } });
      if (firstTask) {
        targetTaskId = firstTask.id;
      } else {
        // Create dummy task
        const proj = await prisma.project.findFirst();
        const sec = await prisma.section.findFirst();
        if (proj && sec) {
          const dummy = await prisma.task.create({
            data: {
              title: "General Focus Session",
              projectId: proj.id,
              sectionId: sec.id,
              createdBy: userId,
              position: 9999,
              status: "DONE",
            },
          });
          targetTaskId = dummy.id;
        }
      }
    }

    if (targetTaskId) {
      await prisma.timeEntry.create({
        data: {
          taskId: targetTaskId,
          userId,
          durationMinutes: durationMinutes || 25,
          type: "FOCUS",
        },
      });

      // Write activity log
      await prisma.activityLog.create({
        data: {
          taskId: targetTaskId,
          userId,
          action: "START_FOCUS",
          newValue: `Completed focus session: ${durationMinutes || 25} minutes`,
        },
      });
    }

    // 3. Update Pet mood to FOCUSED
    await prisma.elphPet.update({
      where: { userId },
      data: {
        mood: "FOCUSED",
      },
    });

    // 4. Update leaderboard weekly entry
    const workspaceMember = await prisma.workspaceMember.findFirst({
      where: { userId },
    });
    if (workspaceMember) {
      const activeWorkspaceId = workspaceMember.workspaceId;
      const entry = await prisma.leaderboardEntry.findUnique({
        where: {
          workspaceId_userId_period: {
            workspaceId: activeWorkspaceId,
            userId,
            period: "WEEKLY",
          },
        },
      });
      if (entry) {
        await prisma.leaderboardEntry.update({
          where: { id: entry.id },
          data: { xp: entry.xp + xpAmount },
        });
      }
    }

    // Check Achievements
    const achievementsUnlocked = await checkAndUnlockAchievements(prisma, userId);

    return NextResponse.json({
      xpGained: xpAmount,
      levelUp: userLevelUp,
      level: nextUserLevel,
      achievementsUnlocked,
    });
  } catch (error) {
    console.error("API Focus Complete Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
