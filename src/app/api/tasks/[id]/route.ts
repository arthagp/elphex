import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const userId = "usr_test";

    // Build update object
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.sectionId !== undefined) updateData.sectionId = body.sectionId;

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        subtasks: { orderBy: { position: "asc" } },
        labels: { include: { label: true } },
        dependencies: { select: { dependsOnTaskId: true, type: true } },
      },
    });

    // Write activity log
    await prisma.activityLog.create({
      data: {
        taskId: id,
        userId,
        action: "UPDATE",
        newValue: JSON.stringify(updateData),
      },
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("API Update Task Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const userId = "usr_test";

    // Soft delete
    const deletedTask = await prisma.task.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Write activity log
    await prisma.activityLog.create({
      data: {
        taskId: id,
        userId,
        action: "DELETE",
      },
    });

    return NextResponse.json({ success: true, deletedTask });
  } catch (error) {
    console.error("API Delete Task Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
