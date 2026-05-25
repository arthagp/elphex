import { NextResponse } from "next/server";
import prisma from "@/lib/db";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { isDone } = await request.json();

    if (isDone === undefined) {
      return NextResponse.json({ error: "Missing isDone field" }, { status: 400 });
    }

    const updatedSubtask = await prisma.subtask.update({
      where: { id },
      data: { isDone },
    });

    return NextResponse.json(updatedSubtask);
  } catch (error) {
    console.error("API Update Subtask Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const deleted = await prisma.subtask.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, deleted });
  } catch (error) {
    console.error("API Delete Subtask Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
