import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST() {
  try {
    const userId = "usr_test";

    const pet = await prisma.elphPet.findUnique({ where: { userId } });
    if (!pet) {
      return NextResponse.json({ error: "Pet not found" }, { status: 404 });
    }

    const updatedPet = await prisma.elphPet.update({
      where: { userId },
      data: {
        mood: "HAPPY",
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
    });
  } catch (error) {
    console.error("API Play Pet Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
