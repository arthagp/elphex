import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export async function POST(request: Request) {
  try {
    const { email, otpCode } = await request.json();

    if (!email || !otpCode) {
      return NextResponse.json({ error: "Email dan kode OTP wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan" }, { status: 404 });
    }

    if (user.isVerified) {
      return NextResponse.json({ error: "Akun ini sudah diverifikasi sebelumnya" }, { status: 400 });
    }

    if (user.otpCode !== otpCode) {
      return NextResponse.json({ error: "Kode OTP tidak valid" }, { status: 400 });
    }

    // 1. Mark user as verified
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        otpCode: null,
      },
    });

    // 2. Initialize default gamification tables
    await prisma.userXP.create({
      data: { userId: user.id, totalXp: 0, level: 1 },
    });

    await prisma.streak.create({
      data: { userId: user.id, currentStreak: 0, longestStreak: 0 },
    });

    await prisma.elphPet.create({
      data: { userId: user.id, name: "Elphy", level: 1, mood: "HAPPY", color: "GREY" },
    });

    // 3. Initialize Personal Workspace and Project
    const personalWorkspace = await prisma.workspace.create({
      data: {
        id: `wsp_${user.id}_personal`,
        name: "Personal Workspace",
        slug: `personal-${user.id}`,
        ownerId: user.id,
        plan: "FREE",
      },
    });

    await prisma.workspaceMember.create({
      data: {
        workspaceId: personalWorkspace.id,
        userId: user.id,
        role: "OWNER",
      },
    });

    const personalProject = await prisma.project.create({
      data: {
        id: `prj_${user.id}_personal`,
        workspaceId: personalWorkspace.id,
        name: "🏠 Personal Tasks",
        color: "#10B981",
        createdBy: user.id,
      },
    });

    // Create default board columns/sections
    const secTodo = await prisma.section.create({
      data: { id: `sec_${user.id}_todo`, projectId: personalProject.id, name: "To Do", position: 1.0 },
    });

    await prisma.section.create({
      data: { id: `sec_${user.id}_doing`, projectId: personalProject.id, name: "In Progress", position: 2.0 },
    });

    await prisma.section.create({
      data: { id: `sec_${user.id}_done`, projectId: personalProject.id, name: "Completed", position: 3.0 },
    });

    // Create a welcome task
    await prisma.task.create({
      data: {
        title: "Selamat datang di Elphex! Selesaikan tugas pertama Anda",
        description: "Cobalah memindahkan tugas ini dari kolom To Do ke In Progress lalu Completed.",
        status: "TODO",
        priority: "LOW",
        projectId: personalProject.id,
        sectionId: secTodo.id,
        createdBy: user.id,
        position: 1000.0,
      },
    });

    // Create general XP rules if not exist (optional, seed handles it usually but good for signup fallback)
    const xpRule = await prisma.xPRule.findFirst();
    if (!xpRule) {
      await prisma.xPRule.createMany({
        data: [
          { eventType: "TASK_COMPLETE", xpAmount: 50 },
          { eventType: "DEADLINE_ON_TIME", xpAmount: 25 },
          { eventType: "FOCUS_COMPLETED", xpAmount: 100 },
          { eventType: "FEED_PET", xpAmount: 15 },
        ],
      });
    }

    // 4. Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("elphex-session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({
      success: true,
      message: "Akun berhasil diverifikasi dan diaktifkan.",
      userId: user.id,
    });
  } catch (error) {
    console.error("API Verify OTP Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
