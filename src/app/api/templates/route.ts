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
    const { name, projectId, title, description, priority, labels, assigneeId, customFields } = body;

    if (!name || !name.trim() || !projectId || !title) {
      return NextResponse.json({ error: "Nama template, boardId, dan judul tugas wajib diisi" }, { status: 400 });
    }

    // Verify project access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json({ error: "Board tidak ditemukan atau Anda tidak memiliki akses" }, { status: 403 });
    }

    // Verify workspace membership
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: project.workspaceId,
        userId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Board tidak ditemukan atau Anda tidak memiliki akses" }, { status: 403 });
    }

    // Create the task template
    const template = await prisma.taskTemplate.create({
      data: {
        name,
        projectId,
        title,
        description: description || null,
        priority: priority || "NONE",
        labels: labels ? JSON.stringify(labels) : null,
        assigneeId: assigneeId || null,
        customFields: customFields ? JSON.stringify(customFields) : null,
      },
    });

    return NextResponse.json(template);
  } catch (error) {
    console.error("API Create Template Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
