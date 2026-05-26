import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    const userId = cookieStore.get("elphex-session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { plan: "PRO" },
    });

    return NextResponse.json({
      success: true,
      message: "Akun berhasil di-upgrade ke paket PRO!",
      plan: user.plan,
    });
  } catch (error) {
    console.error("API Upgrade Plan Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
