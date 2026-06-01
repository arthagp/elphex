import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export async function GET(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("elphex-session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username || username.trim().length < 2) {
      return NextResponse.json([]);
    }

    // Find users with matching username, excluding current user
    const users = await prisma.user.findMany({
      where: {
        username: {
          contains: username.trim().toLowerCase(),
        },
        id: {
          not: userId,
        },
      },
      select: {
        id: true,
        username: true,
        email: true,
        profile: {
          select: {
            name: true,
            avatarUrl: true,
          },
        },
      },
      take: 10,
    });

    return NextResponse.json(users);
  } catch (error) {
    console.error("API User Search Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
