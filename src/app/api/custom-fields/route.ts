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

    const { name, type, options, projectId } = await request.json();

    if (!name || !name.trim() || !type || !projectId) {
      return NextResponse.json({ error: "Nama, tipe, dan projectId wajib diisi" }, { status: 400 });
    }

    // Verify project access
    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      console.log("DEBUG custom-fields POST: Project not found for ID:", projectId);
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
      console.log("DEBUG custom-fields POST: Membership not found. Workspace ID:", project.workspaceId, "User ID:", userId);
      return NextResponse.json({ error: "Board tidak ditemukan atau Anda tidak memiliki akses" }, { status: 403 });
    }

    // Create the definition
    const fieldDef = await prisma.customFieldDefinition.create({
      data: {
        name,
        type,
        options: options || null,
        projectId,
      },
    });

    return NextResponse.json(fieldDef);
  } catch (error) {
    console.error("API Create Custom Field Def Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
