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

    const { username, projectId } = await request.json();

    if (!username || !projectId) {
      return NextResponse.json({ error: "Username dan projectId wajib diisi" }, { status: 400 });
    }

    // Verify board exists
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: true,
      },
    });

    if (!project) {
      return NextResponse.json({ error: "Board tidak ditemukan atau Anda tidak memiliki akses" }, { status: 403 });
    }

    // Verify user has access (workspace member)
    const membership = await prisma.workspaceMember.findFirst({
      where: {
        workspaceId: project.workspaceId,
        userId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: "Board tidak ditemukan atau Anda tidak memiliki akses" }, { status: 403 });
    }

    // Check user plan (PRO check for collaboration)
    const currentUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (currentUser?.plan !== "PRO" && !project.workspaceId.includes("personal")) {
      return NextResponse.json({ error: "Fitur kolaborasi tim hanya tersedia untuk akun PRO" }, { status: 403 });
    }

    // Find invitee by username
    const invitee = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
    });

    if (!invitee) {
      return NextResponse.json({ error: "Pengguna dengan username tersebut tidak ditemukan" }, { status: 404 });
    }

    if (invitee.id === userId) {
      return NextResponse.json({ error: "Anda tidak bisa mengundang diri sendiri" }, { status: 400 });
    }

    // Check if invitee is already a member of the workspace
    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId: project.workspaceId,
          userId: invitee.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: "Pengguna tersebut sudah berada di dalam board ini" }, { status: 400 });
    }

    // Check if an active invitation already exists
    const existingInvite = await prisma.boardInvitation.findUnique({
      where: {
        projectId_inviteeId: {
          projectId,
          inviteeId: invitee.id,
        },
      },
    });

    if (existingInvite && existingInvite.status === "PENDING") {
      return NextResponse.json({ error: "Undangan kolaborasi sudah dikirim sebelumnya" }, { status: 400 });
    }

    // Create or update invitation to PENDING
    const invitation = await prisma.boardInvitation.upsert({
      where: {
        projectId_inviteeId: {
          projectId,
          inviteeId: invitee.id,
        },
      },
      update: {
        inviterId: userId,
        status: "PENDING",
      },
      create: {
        projectId,
        inviteeId: invitee.id,
        inviterId: userId,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, invitation });
  } catch (error) {
    console.error("API Create Board Invitation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
