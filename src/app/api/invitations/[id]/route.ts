import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const cookieStore = await cookies();
    const userId = cookieStore.get("elphex-session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action } = await request.json();

    if (!action || (action !== "ACCEPT" && action !== "DECLINE")) {
      return NextResponse.json({ error: "Aksi harus ACCEPT atau DECLINE" }, { status: 400 });
    }

    // Find invitation
    const invitation = await prisma.boardInvitation.findUnique({
      where: { id },
      include: {
        project: true,
      },
    });

    if (!invitation) {
      return NextResponse.json({ error: "Undangan tidak ditemukan" }, { status: 404 });
    }

    if (invitation.inviteeId !== userId) {
      return NextResponse.json({ error: "Anda tidak memiliki wewenang untuk menanggapi undangan ini" }, { status: 403 });
    }

    if (invitation.status !== "PENDING") {
      return NextResponse.json({ error: "Undangan ini sudah diproses sebelumnya" }, { status: 400 });
    }

    if (action === "ACCEPT") {
      // Update invitation status
      await prisma.boardInvitation.update({
        where: { id },
        data: { status: "ACCEPTED" },
      });

      // Add to WorkspaceMember
      const existingMember = await prisma.workspaceMember.findUnique({
        where: {
          workspaceId_userId: {
            workspaceId: invitation.project.workspaceId,
            userId,
          },
        },
      });

      if (!existingMember) {
        await prisma.workspaceMember.create({
          data: {
            workspaceId: invitation.project.workspaceId,
            userId,
            role: "MEMBER",
          },
        });
      }

      // Award XP for collaborating
      const userXP = await prisma.userXP.findUnique({ where: { userId } });
      let levelUp = false;
      let newLevel = userXP?.level || 1;
      
      if (userXP) {
        const addedXp = 30; // +30 XP
        const nextXp = userXP.totalXp + addedXp;
        const requiredXp = newLevel * 200; // assume 200 XP per level
        
        if (nextXp >= requiredXp) {
          newLevel += 1;
          levelUp = true;
        }

        await prisma.userXP.update({
          where: { userId },
          data: {
            totalXp: nextXp,
            level: newLevel,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Berhasil menerima undangan dan bergabung ke board.",
        xpGained: 30,
        levelUp,
        level: newLevel,
      });
    } else {
      // DECLINE
      await prisma.boardInvitation.update({
        where: { id },
        data: { status: "DECLINED" },
      });

      return NextResponse.json({
        success: true,
        message: "Berhasil menolak undangan.",
      });
    }
  } catch (error) {
    console.error("API Respond Board Invitation Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
