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

    // Check user plan
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user || user.plan !== "PRO") {
      return NextResponse.json({ error: "Membuat organisasi baru hanya tersedia untuk akun PRO" }, { status: 403 });
    }

    const { name } = await request.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Nama organisasi wajib diisi" }, { status: 400 });
    }

    const slug = `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Create workspace
    const workspace = await prisma.workspace.create({
      data: {
        name,
        slug,
        ownerId: userId,
        plan: "PRO",
        members: {
          create: {
            userId,
            role: "OWNER",
          },
        },
      },
    });

    // Create a default project for this workspace
    const project = await prisma.project.create({
      data: {
        workspaceId: workspace.id,
        name: "📂 Proyek Utama",
        color: "#0085FF",
        createdBy: userId,
      },
    });

    // Create default sections
    await prisma.section.createMany({
      data: [
        { id: `sec_todo_${workspace.id}`, projectId: project.id, name: "To Do", position: 1.0 },
        { id: `sec_ongoing_${workspace.id}`, projectId: project.id, name: "Ongoing", position: 2.0 },
        { id: `sec_done_${workspace.id}`, projectId: project.id, name: "Done", position: 3.0 },
      ],
    });

    return NextResponse.json(workspace);
  } catch (error) {
    console.error("API Create Workspace Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
