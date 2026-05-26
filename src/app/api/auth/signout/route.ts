import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    const cookieStore = await cookies();
    cookieStore.delete("elphex-session");

    return NextResponse.json({ success: true, message: "Berhasil keluar" });
  } catch (error) {
    console.error("API Signout Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
