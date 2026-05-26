import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";
import { cookies } from "next/headers";

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email dan password wajib diisi" }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      return NextResponse.json({ error: "Email atau password salah" }, { status: 401 });
    }

    if (!user.isVerified) {
      // Re-generate OTP if they aren't verified yet so they can verify now
      const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
      await prisma.user.update({
        where: { id: user.id },
        data: { otpCode },
      });

      console.log("=========================================");
      console.log(`[WA OTP SIMULATOR] Mengirim ulang OTP ke ${user.phone}`);
      console.log(`[WA OTP SIMULATOR] Kode OTP Anda: ${otpCode}`);
      console.log("=========================================");

      return NextResponse.json({
        success: false,
        error: "Akun Anda belum diverifikasi. Redirect ke halaman verifikasi.",
        needsVerification: true,
        email: user.email,
      }, { status: 403 });
    }

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set("elphex-session", user.id, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 1 week
    });

    return NextResponse.json({
      success: true,
      message: "Login berhasil",
      userId: user.id,
    });
  } catch (error) {
    console.error("API Signin Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
