import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types";

export async function createTask(req: AuthRequest, res: Response) {
  const { projectId } = req.params;
  const { title, description, status, priority, dueDate, assigneeId } = req.body;
  const creatorId = req.user!.userId;

  // If assigning to someone, make sure they're in the project
  if (assigneeId) {
    const isMember = await prisma.teamMember.findUnique({
      where: { userId_projectId: { userId: assigneeId, projectId } },
    });
    const isOwner = await prisma.project
      .findUnique({ where: { id: projectId } })
      .then((p) => p?.ownerId === assigneeId);

    if (!isMember && !isOwner) {
      return res.status(400).json({
        success: false,
        error: "Assignee must be a member of this project.",
      });
    }
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      status: status || "TODO",
      priority: priority || "MEDIUM",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      projectId,
      creatorId,
      assigneeId: assigneeId || null,
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  return res.status(201).json({
    success: true,
    message: "Task created.",
    data: { task },
  });
}

export async function getTasksByProject(req: AuthRequest, res: Response) {
  const { projectId } = req.params;
  const { status, priority, assigneeId } = req.query;

  const tasks = await prisma.task.findMany({
    where: {
      projectId,
      ...(status && { status: status as string as never }),
      ...(priority && { priority: priority as string as never }),
      ...(assigneeId && { assigneeId: assigneeId as string }),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
    orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
  });

  return res.json({ success: true, data: { tasks } });
}

export async function getTaskById(req: AuthRequest, res: Response) {
  const { taskId } = req.params;

  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      creator: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
    },
  });

  if (!task) {
    return res.status(404).json({ success: false, error: "Task not found." });
  }

  return res.json({ success: true, data: { task } });
}

export async function updateTask(req: AuthRequest, res: Response) {
  const { taskId } = req.params;
  const { title, description, status, priority, dueDate, assigneeId } = req.body;

  const task = await prisma.task.update({
    where: { id: taskId },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(status !== undefined && { status }),
      ...(priority !== undefined && { priority }),
      ...(dueDate !== undefined && { dueDate: dueDate ? new Date(dueDate) : null }),
      ...(assigneeId !== undefined && { assigneeId: assigneeId || null }),
    },
    include: {
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
      creator: { select: { id: true, name: true, email: true } },
    },
  });

  return res.json({
    success: true,
    message: "Task updated.",
    data: { task },
  });
}

export async function deleteTask(req: AuthRequest, res: Response) {
  const { taskId } = req.params;
  const userId = req.user!.userId;

  const task = await prisma.task.findUnique({ where: { id: taskId } });
  if (!task) {
    return res.status(404).json({ success: false, error: "Task not found." });
  }

  // Only task creator or project admin/owner can delete
  const project = await prisma.project.findUnique({
    where: { id: task.projectId },
    include: { members: { where: { userId } } },
  });

  const isCreator = task.creatorId === userId;
  const isOwner = project?.ownerId === userId;
  const isAdmin =
    project?.members && project.members.length > 0
      ? project.members[0].role === "ADMIN"
      : false;

  if (!isCreator && !isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: "Only the task creator or a project admin can delete this task.",
    });
  }

  await prisma.task.delete({ where: { id: taskId } });

  return res.json({ success: true, message: "Task deleted." });
}

export async function getMyTasks(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const { status } = req.query;

  const tasks = await prisma.task.findMany({
    where: {
      assigneeId: userId,
      ...(status && { status: status as string as never }),
    },
    include: {
      project: { select: { id: true, name: true } },
      assignee: { select: { id: true, name: true, email: true, avatar: true } },
    },
    orderBy: [{ dueDate: "asc" }, { priority: "desc" }],
  });

  return res.json({ success: true, data: { tasks } });
}