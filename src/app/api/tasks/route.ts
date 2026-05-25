import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function POST(request: Request) {
  try {
    const userId = "usr_test";
    const body = await request.json();
    const { title, projectId, sectionId, priority, dueDate } = body;

    if (!title || !projectId || !sectionId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Get maximum position in that section
    const maxTask = await prisma.task.findFirst({
      where: { sectionId, deletedAt: null },
      orderBy: { position: "desc" },
    });
    const nextPosition = maxTask ? maxTask.position + 1000 : 1000;

    const newTask = await prisma.task.create({
      data: {
        title,
        description: body.description || "",
        status: "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        projectId,
        sectionId,
        createdBy: userId,
        position: nextPosition,
      },
      include: {
        subtasks: true,
        labels: { include: { label: true } },
        dependencies: { select: { dependsOnTaskId: true, type: true } },
      },
    });

    // Write activity log
    await prisma.activityLog.create({
      data: {
        taskId: newTask.id,
        userId,
        action: "CREATE",
        newValue: title,
      },
    });

    return NextResponse.json(newTask);
  } catch (error) {
    console.error("API Create Task Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
