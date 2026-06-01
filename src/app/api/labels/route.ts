import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("elphex-session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { workspaceId, name, color } = body;

    if (!workspaceId || !name || !color) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newLabel = await prisma.label.create({
      data: {
        workspaceId,
        name,
        color,
      },
    });

    return NextResponse.json(newLabel);
  } catch (error) {
    console.error("API Create Label Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
