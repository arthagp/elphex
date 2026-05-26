import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { getLevelFromXp } from "@/lib/gameEngine";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("elphex-session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const { rewardId } = await request.json();

    if (!rewardId) {
      return NextResponse.json({ error: "Missing rewardId" }, { status: 400 });
    }

    // 1. Fetch reward item
    const reward = await prisma.rewardItem.findUnique({
      where: { id: rewardId },
    });

    if (!reward) {
      return NextResponse.json({ error: "Reward item not found" }, { status: 404 });
    }

    // 2. Fetch user XP
    const userXp = await prisma.userXP.findUnique({ where: { userId } });
    if (!userXp || userXp.totalXp < reward.xpCost) {
      return NextResponse.json({ error: "Insufficient XP" }, { status: 400 });
    }

    // 3. Subtract XP and check user rewards
    const newTotalXp = userXp.totalXp - reward.xpCost;
    const nextLevel = getLevelFromXp(newTotalXp);

    // Create user reward purchase
    await prisma.userReward.create({
      data: {
        userId,
        rewardId,
      },
    });

    // Update User XP
    await prisma.userXP.update({
      where: { userId },
      data: {
        totalXp: newTotalXp,
        level: nextLevel,
      },
    });

    // 4. Special behaviors based on item type
    // If purchased theme or pet color, apply it
    if (reward.type === "PET_COLOR") {
      let petColor = "GREY";
      if (rewardId.includes("blue")) petColor = "BLUE";
      if (rewardId.includes("gold")) petColor = "GOLD";
      if (rewardId.includes("cosmic")) petColor = "COSMIC";
      if (rewardId.includes("purple")) petColor = "PURPLE";

      await prisma.elphPet.update({
        where: { userId },
        data: { color: petColor },
      });
    }

    // Write activity log
    await prisma.activityLog.create({
      data: {
        taskId: "tsk_reward_purchase",
        userId,
        action: "ADD_XP", // represents XP alteration
        newValue: `Purchased reward ${reward.name} for ${reward.xpCost} XP`,
      },
    });

    return NextResponse.json({ success: true, newTotalXp, nextLevel });
  } catch (error) {
    console.error("API Purchase Reward Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
