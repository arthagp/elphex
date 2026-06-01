import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import crypto from "crypto";

function hashPassword(password: string) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

export async function POST(request: Request) {
  try {
    const { name, username, email, phone, password, confirmPassword } = await request.json();

    if (!name || !username || !email || !phone || !password || !confirmPassword) {
      return NextResponse.json({ error: "Semua kolom wajib diisi" }, { status: 400 });
    }

    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Password dan konfirmasi password tidak cocok" }, { status: 400 });
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username: username.trim().toLowerCase() },
    });

    if (existingUsername) {
      return NextResponse.json({ error: "Username sudah terdaftar" }, { status: 400 });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Email sudah terdaftar" }, { status: 400 });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const passwordHash = hashPassword(password);

    // Create user and profile
    const user = await prisma.user.create({
      data: {
        username: username.trim().toLowerCase(),
        email,
        passwordHash,
        phone,
        otpCode,
        isVerified: false,
        profile: {
          create: {
            name,
          },
        },
      },
    });

    // Simulate sending OTP to WhatsApp
    console.log("=========================================");
    console.log(`[WA OTP SIMULATOR] Mengirim OTP ke ${phone}`);
    console.log(`[WA OTP SIMULATOR] Kode OTP Anda: ${otpCode}`);
    console.log("=========================================");

    return NextResponse.json({
      success: true,
      message: "Registrasi berhasil. Silakan verifikasi OTP yang dikirim ke nomor WA Anda.",
      email: user.email,
    });
  } catch (error) {
    console.error("API Signup Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
