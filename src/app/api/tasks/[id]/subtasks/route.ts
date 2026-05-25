import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: taskId } = await params;
    const { title } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Missing title" }, { status: 400 });
    }

    // Get max position
    const maxSub = await prisma.subtask.findFirst({
      where: { taskId },
      orderBy: { position: "desc" },
    });
    const nextPosition = maxSub ? maxSub.position + 1000 : 1000;

    const newSubtask = await prisma.subtask.create({
      data: {
        title,
        taskId,
        isDone: false,
        position: nextPosition,
      },
    });

    return NextResponse.json(newSubtask);
  } catch (error) {
    console.error("API Create Subtask Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
