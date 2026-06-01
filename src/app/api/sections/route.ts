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

    const { name, projectId } = await request.json();

    if (!name || !name.trim() || !projectId) {
      return NextResponse.json({ error: "Nama list dan projectId wajib diisi" }, { status: 400 });
    }

    // Verify the project exists and the user has access via workspace membership
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Board tidak ditemukan" }, { status: 404 });
    }

    const membership = await prisma.workspaceMember.findFirst({
      where: { workspaceId: project.workspaceId, userId },
    });

    if (!membership) {
      return NextResponse.json({ error: "Anda tidak memiliki akses ke board ini" }, { status: 403 });
    }

    // Determine the next position (append after the last section)
    const lastSection = await prisma.section.findFirst({
      where: { projectId },
      orderBy: { position: "desc" },
    });

    const nextPosition = (lastSection?.position ?? 0) + 1;

    const section = await prisma.section.create({
      data: {
        projectId,
        name: name.trim(),
        position: nextPosition,
      },
    });

    return NextResponse.json(section);
  } catch (error) {
    console.error("API Create Section Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
