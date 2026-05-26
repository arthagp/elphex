import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getLevelFromXp, checkAndUnlockAchievements } from "@/lib/gameEngine";
import { cookies } from "next/headers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { status } = await request.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get("elphex-session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }

    // 1. Fetch current task
    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const previousStatus = task.status;
    
    // 2. Update task status
    const updatedTask = await prisma.task.update({
      where: { id },
      data: { status },
    });

    // Write activity log
    await prisma.activityLog.create({
      data: {
        taskId: id,
        userId,
        action: status === "DONE" ? "COMPLETE" : "UPDATE",
        oldValue: previousStatus,
        newValue: status,
      },
    });

    let xpGained = 0;
    let levelUp = false;
    let newLevel = 1;
    let achievementsUnlocked: string[] = [];

    // 3. Process gamification if moving to DONE
    if (status === "DONE" && previousStatus !== "DONE") {
      // Base XP
      let baseXP = 50; // default for task completion

      // Check XP Rules database
      const rule = await prisma.xPRule.findUnique({ where: { eventType: "TASK_COMPLETE" } });
      if (rule) baseXP = rule.xpAmount;

      // Check deadline bonus
      let bonusXP = 0;
      if (task.dueDate && new Date(task.dueDate) >= new Date()) {
        const bonusRule = await prisma.xPRule.findUnique({ where: { eventType: "DEADLINE_ON_TIME" } });
        bonusXP = bonusRule ? bonusRule.xpAmount : 25;
      }

      // Check streak multiplier
      const streak = await prisma.streak.findUnique({ where: { userId } });
      const currentStreak = streak ? streak.currentStreak : 0;
      // Multiplier formula: 1.0 + (streak * 0.1), max 2.0
      const multiplier = Math.min(2.0, 1.0 + currentStreak * 0.1);
      
      xpGained = Math.round((baseXP + bonusXP) * multiplier);

      // Fetch user XP
      let userXp = await prisma.userXP.findUnique({ where: { userId } });
      if (!userXp) {
        userXp = await prisma.userXP.create({
          data: { userId, totalXp: 0, level: 1 },
        });
      }

      const previousLevel = userXp.level;
      const newTotalXp = userXp.totalXp + xpGained;
      newLevel = getLevelFromXp(newTotalXp);
      levelUp = newLevel > previousLevel;

      // Update User XP
      await prisma.userXP.update({
        where: { userId },
        data: {
          totalXp: newTotalXp,
          level: newLevel,
        },
      });

      // Update leaderboard weekly entry
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
            data: { xp: entry.xp + xpGained },
          });
        }
      }

      // Update Pet Mood to EXCITED and give small pet level up chance or boost
      const pet = await prisma.elphPet.findUnique({ where: { userId } });
      if (pet) {
        await prisma.elphPet.update({
          where: { userId },
          data: {
            mood: "EXCITED",
            // completed tasks feed pet slightly
            level: Math.random() < 0.05 ? pet.level + 1 : pet.level,
          },
        });
      }

      // Check Achievements
      achievementsUnlocked = await checkAndUnlockAchievements(prisma, userId);
    }

    return NextResponse.json({
      task: updatedTask,
      xpGained,
      levelUp,
      level: newLevel,
      achievementsUnlocked,
    });
  } catch (error) {
    console.error("API Task Status Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
