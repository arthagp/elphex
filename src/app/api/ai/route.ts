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
      return NextResponse.json({ error: "Fitur AI Assistant hanya tersedia untuk akun PRO" }, { status: 403 });
    }

    const { taskTitle, description, action } = await request.json();

    if (!taskTitle) {
      return NextResponse.json({ error: "Missing taskTitle" }, { status: 400 });
    }

    // Standard Next.js server configuration check for actual AI keys
    const hasAIKey = process.env.OPENAI_API_KEY || process.env.ANTHROPIC_API_KEY || process.env.GEMINI_API_KEY;

    if (hasAIKey) {
      // In production, we would integrate the Vercel AI SDK here.
      // E.g. using `generateText` from `ai` package.
      // E.g.:
      // const { text } = await generateText({
      //   model: openai('gpt-4-turbo'),
      //   prompt: `Break down the task "${taskTitle}" into subtasks...`
      // });
      // But since we want local development to work instantly, we fall back gracefully or simulate.
    }

    // High fidelity mock AI assistant responses ("Elephant Brain")
    // Highly context-aware based on titles and actions

    let responseData: any = {};

    if (action === "breakdown") {
      let subtasks: string[] = [];
      const titleLower = taskTitle.toLowerCase();

      if (titleLower.includes("next") || titleLower.includes("tailwind") || titleLower.includes("css") || titleLower.includes("ui") || titleLower.includes("store")) {
        subtasks = [
          "Konfigurasi file import dan reset css global",
          "Buat layout navigasi sidebar dan panel utama",
          "Implementasikan interaksi UI (hover, focus, radial indicators)",
          "Integrasikan data binding dari Zustand store",
          "Tambahkan visual feedback dan animasi transisi (Framer Motion)",
          "Uji responsivitas pada layar handphone dan tablet",
        ];
      } else if (titleLower.includes("prisma") || titleLower.includes("db") || titleLower.includes("database") || titleLower.includes("schema") || titleLower.includes("migrasi")) {
        subtasks = [
          "Definisikan tipe kolom dan relasi relasional dalam schema.prisma",
          "Jalankan npx prisma migrate dev untuk sinkronisasi lokal SQLite",
          "Tulis file seeder.ts untuk populasi awal data pengujian",
          "Buat modul db.ts singleton untuk inisialisasi PrismaClient",
          "Tambahkan index SQL pada kolom yang sering dicari",
        ];
      } else if (titleLower.includes("ai") || titleLower.includes("assistant") || titleLower.includes("elephant") || titleLower.includes("brain")) {
        subtasks = [
          "Setup modul API handler untuk memproses request AI",
          "Tambahkan parser payload input (taskTitle, action, dll)",
          "Buat fallback lokal berbasis aturan untuk kondisi offline",
          "Implementasikan prompt engineering untuk sub-task breakdown",
          "Hubungkan UI asisten sidebar dengan tombol pemicu AI",
        ];
      } else {
        subtasks = [
          "Riset persyaratan teknis dan rancang alur kerja",
          "Tulis draf rencana implementasi kode dasar",
          "Tulis kode fungsi logika inti beserta validasi parameter",
          "Uji fungsionalitas unit test secara lokal",
          "Lakukan refactoring dan pembersihan variabel tidak terpakai",
        ];
      }

      responseData = {
        action: "breakdown",
        subtasks,
        advice: `Gajah tidak pernah lupa, dan dengan sub-tugas ini, alur kerjamu juga tidak akan terlewat! Saya menyarankan untuk menyelesaikan tugas ini secara berurutan agar efisien.`,
      };
    } else if (action === "estimate") {
      const titleLower = taskTitle.toLowerCase();
      let hours = 2;
      let complexity = "Rendah";

      if (titleLower.includes("setup") || titleLower.includes("init")) {
        hours = 2;
        complexity = "Rendah";
      } else if (titleLower.includes("schema") || titleLower.includes("database") || titleLower.includes("store") || titleLower.includes("layout")) {
        hours = 4;
        complexity = "Sedang";
      } else if (titleLower.includes("integration") || titleLower.includes("ai") || titleLower.includes("deploy")) {
        hours = 6;
        complexity = "Tinggi";
      } else {
        hours = 3;
        complexity = "Sedang";
      }

      responseData = {
        action: "estimate",
        estimatedHours: hours,
        complexity,
        advice: `Tugas "${taskTitle}" diperkirakan memakan waktu ${hours} jam dengan kompleksitas ${complexity}. Saya menyarankan untuk menggunakan teknik Pomodoro Fokus selama ${Math.ceil((hours * 60) / 25)} sesi.`,
      };
    } else {
      // Prioritize
      const titleLower = taskTitle.toLowerCase();
      let priority = "MEDIUM";
      let reasoning = "Tugas ini memiliki tenggat waktu standar.";

      if (titleLower.includes("bug") || titleLower.includes("error") || titleLower.includes("fix") || titleLower.includes("urgent")) {
        priority = "URGENT";
        reasoning = "Perbaikan bug/error harus segera ditangani untuk menghindari hambatan dalam pengembangan.";
      } else if (titleLower.includes("setup") || titleLower.includes("init") || titleLower.includes("prisma")) {
        priority = "HIGH";
        reasoning = "Tugas fondasi seperti database dan inisialisasi proyek harus didahulukan.";
      } else if (titleLower.includes("polish") || titleLower.includes("style") || titleLower.includes("clean")) {
        priority = "LOW";
        reasoning = "Polesan estetika dan pembersihan kode bisa ditunda setelah fungsi inti berjalan.";
      }

      responseData = {
        action: "prioritize",
        suggestedPriority: priority,
        reasoning,
        advice: `Berdasarkan analisis konteks, saya menyarankan prioritas ${priority} karena: ${reasoning}`,
      };
    }

    // Add a small 400ms delay to make it feel like "Elephant Brain is thinking"
    await new Promise((resolve) => setTimeout(resolve, 400));

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("API AI Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
