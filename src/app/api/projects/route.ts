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

    const { name, color, workspaceId } = await request.json();

    if (!name || !name.trim() || !workspaceId) {
      return NextResponse.json({ error: "Nama board dan workspaceId wajib diisi" }, { status: 400 });
    }

    // Verify workspace membership
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId,
        userId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Anda tidak memiliki akses ke ruang kerja ini" }, { status: 403 });
    }

    // Create the Project (Board)
    const project = await prisma.project.create({
      data: {
        workspaceId,
        name,
        color: color || "#0085FF",
        createdBy: userId,
      },
    });

    // Create default board lists/sections
    await prisma.section.createMany({
      data: [
        { projectId: project.id, name: "To Do", position: 1.0 },
        { projectId: project.id, name: "Ongoing", position: 2.0 },
        { projectId: project.id, name: "Done", position: 3.0 },
      ],
    });

    // Fetch the created sections
    const createdSections = await prisma.section.findMany({
      where: { projectId: project.id },
      orderBy: { position: "asc" },
    });

    return NextResponse.json({ project, sections: createdSections });
  } catch (error) {
    console.error("API Create Project Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
