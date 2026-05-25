export function getLevelFromXp(xp: number): number {
  return Math.floor(Math.sqrt(xp / 50)) + 1;
}

export function getXpThresholdForLevel(level: number): number {
  // Cumulative XP needed to reach this level
  return (level - 1) * (level - 1) * 50;
}

export function getXpForCurrentLevelProgress(xp: number): { current: number; max: number; percent: number } {
  const level = getLevelFromXp(xp);
  const currentLevelMin = getXpThresholdForLevel(level);
  const nextLevelMin = getXpThresholdForLevel(level + 1);
  
  const current = xp - currentLevelMin;
  const max = nextLevelMin - currentLevelMin;
  const percent = Math.min(100, Math.max(0, (current / max) * 100));
  
  return { current, max, percent };
}

export function getLevelTitle(level: number): string {
  if (level >= 100) return "Lord of the Savanna 👑";
  if (level >= 75) return "Elder Tusk 🐘";
  if (level >= 50) return "Mighty Bull 🦾";
  if (level >= 30) return "Herd Protector 🛡️";
  if (level >= 15) return "Savanna Roamer 🌾";
  if (level >= 5) return "Jumbo Tusklet 🌟";
  return "Cub 🌱";
}

export async function checkAndUnlockAchievements(prisma: any, userId: string): Promise<string[]> {
  const unlockedAchievementNames: string[] = [];
  
  try {
    // 1. Get user statistics
    const tasksCompletedCount = await prisma.task.count({
      where: { createdBy: userId, status: "DONE" },
    });
    
    const xpRecord = await prisma.userXP.findUnique({ where: { userId } });
    const userLevel = xpRecord ? xpRecord.level : 1;
    
    const timeEntries = await prisma.timeEntry.findMany({
      where: { userId, type: "FOCUS" },
    });
    const focusMinutes = timeEntries.reduce((acc: number, entry: any) => acc + entry.durationMinutes, 0);
    const focusHours = focusMinutes / 60;
    
    // 2. Fetch all achievements
    const allAchievements = await prisma.achievement.findMany();
    
    // 3. Fetch already unlocked achievements
    const alreadyUnlocked = await prisma.userAchievement.findMany({
      where: { userId },
      select: { achievementId: true },
    });
    const unlockedIds = new Set(alreadyUnlocked.map((a: any) => a.achievementId));
    
    // 4. Check conditions
    for (const ach of allAchievements) {
      if (unlockedIds.has(ach.id)) continue;
      
      let conditionMet = false;
      if (ach.conditionType === "TASKS_COMPLETED" && tasksCompletedCount >= ach.conditionValue) {
        conditionMet = true;
      } else if (ach.conditionType === "LEVEL_REACHED" && userLevel >= ach.conditionValue) {
        conditionMet = true;
      } else if (ach.conditionType === "FOCUS_HOURS" && focusHours >= ach.conditionValue) {
        conditionMet = true;
      }
      
      if (conditionMet) {
        await prisma.userAchievement.create({
          data: {
            userId,
            achievementId: ach.id,
          },
        });
        unlockedAchievementNames.push(`${ach.icon} ${ach.name}`);
      }
    }
  } catch (error) {
    console.error("Error checking achievements:", error);
  }
  
  return unlockedAchievementNames;
}
