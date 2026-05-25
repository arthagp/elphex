import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getLevelFromXp } from "@/lib/gameEngine";

export async function POST(request: Request) {
  try {
    const userId = "usr_test";
    const { foodType } = await request.json(); // e.g. peanuts, grass, sugar-cube

    if (!foodType) {
      return NextResponse.json({ error: "Missing food type" }, { status: 400 });
    }

    const pet = await prisma.elphPet.findUnique({ where: { userId } });
    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    // 20% chance to level up pet on feed
    const didLevelUp = Math.random() < 0.20;
    const nextPetLevel = didLevelUp ? pet.level + 1 : pet.level;

    // Update Pet
    const updatedPet = await prisma.elphPet.update({
      where: { userId },
      data: {
        lastFedAt: new Date(),
        mood: "EXCITED",
        level: nextPetLevel,
      },
    });

    // Award user 15 XP
    const xpRule = await prisma.xPRule.findUnique({ where: { eventType: "FEED_PET" } });
    const xpAmount = xpRule ? xpRule.xpAmount : 15;

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

    await prisma.userXP.update({
      where: { userId },
      data: {
        totalXp: newTotalXp,
        level: nextUserLevel,
      },
    });

    // Write activity log
    await prisma.activityLog.create({
      data: {
        taskId: "tsk_pet_feed", // custom indicator
        userId,
        action: "ADD_XP",
        newValue: `Feed pet: ${xpAmount} XP`,
      },
    });

    return NextResponse.json({
      pet: {
        name: updatedPet.name,
        level: updatedPet.level,
        mood: updatedPet.mood,
        color: updatedPet.color,
        lastFedAt: updatedPet.lastFedAt.toISOString(),
      },
      xpGained: xpAmount,
      levelUp: userLevelUp,
      userLevel: nextUserLevel,
    });
  } catch (error) {
    console.error("API Feed Pet Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
