import { NextResponse } from "next/server";
import prisma from "@/lib/db";
import { cookies } from "next/headers";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const cookieStore = await cookies();
    const userId = cookieStore.get("elphex-session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Build update object
    const updateData: any = {};
    if (body.title !== undefined) updateData.title = body.title;
    if (body.description !== undefined) updateData.description = body.description;
    if (body.status !== undefined) updateData.status = body.status;
    if (body.priority !== undefined) updateData.priority = body.priority;
    if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
    if (body.startDate !== undefined) updateData.startDate = body.startDate ? new Date(body.startDate) : null;
    if (body.dueDateReminder !== undefined) updateData.dueDateReminder = body.dueDateReminder;
    if (body.position !== undefined) updateData.position = body.position;
    if (body.sectionId !== undefined) updateData.sectionId = body.sectionId;
    if (body.calendarType !== undefined) updateData.calendarType = body.calendarType;

    if (body.assigneeId !== undefined) {
      await prisma.taskAssignee.deleteMany({
        where: { taskId: id },
      });
      if (body.assigneeId) {
        await prisma.taskAssignee.create({
          data: {
            taskId: id,
            userId: body.assigneeId,
          },
        });
      }
    }

    if (body.labels !== undefined && Array.isArray(body.labels)) {
      await prisma.taskLabel.deleteMany({
        where: { taskId: id },
      });
      if (body.labels.length > 0) {
        await prisma.taskLabel.createMany({
          data: body.labels.map((labelId: string) => ({
            taskId: id,
            labelId,
          })),
        });
      }
    }

    // Upsert custom field values if provided
    if (body.customFieldValues !== undefined && Array.isArray(body.customFieldValues)) {
      for (const cf of body.customFieldValues) {
        await prisma.taskCustomFieldValue.upsert({
          where: {
            taskId_fieldId: {
              taskId: id,
              fieldId: cf.fieldId,
            },
          },
          update: {
            value: String(cf.value),
          },
          create: {
            taskId: id,
            fieldId: cf.fieldId,
            value: String(cf.value),
          },
        });
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        subtasks: { orderBy: { position: "asc" } },
        labels: { include: { label: true } },
        dependencies: { select: { dependsOnTaskId: true, type: true } },
        customFieldValues: { include: { field: true } },
        assignees: {
          include: {
            user: {
              include: {
                profile: true,
              },
            },
          },
        },
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
    const cookieStore = await cookies();
    const userId = cookieStore.get("elphex-session")?.value;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
