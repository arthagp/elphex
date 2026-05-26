import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("elphex-session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
