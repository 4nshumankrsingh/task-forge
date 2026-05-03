import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types";

export async function getDashboardStats(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;
  const now = new Date();

  // Run in parallel for performance
  const [
    totalProjects,
    assignedTasks,
    overdueTasks,
    tasksByStatus,
    recentTasks,
    upcomingTasks,
  ] = await Promise.all([
    // Projects the user is part of
    prisma.project.count({
      where: {
        OR: [{ ownerId: userId }, { members: { some: { userId } } }],
      },
    }),

    // Tasks assigned to the user
    prisma.task.count({ where: { assigneeId: userId } }),

    // Overdue tasks (past due date, not done)
    prisma.task.count({
      where: {
        assigneeId: userId,
        dueDate: { lt: now },
        status: { not: "DONE" },
      },
    }),

    // Task count grouped by status
    prisma.task.groupBy({
      by: ["status"],
      where: { assigneeId: userId },
      _count: { status: true },
    }),

    // 5 most recently updated tasks
    prisma.task.findMany({
      where: { assigneeId: userId },
      take: 5,
      orderBy: { updatedAt: "desc" },
      include: {
        project: { select: { id: true, name: true } },
      },
    }),

    // Upcoming tasks due in next 7 days
    prisma.task.findMany({
      where: {
        assigneeId: userId,
        dueDate: {
          gte: now,
          lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
        },
        status: { not: "DONE" },
      },
      orderBy: { dueDate: "asc" },
      include: {
        project: { select: { id: true, name: true } },
      },
    }),
  ]);

  const statusMap = tasksByStatus.reduce(
    (acc: Record<string, number>, item: typeof tasksByStatus[0]) => {
      acc[item.status] = item._count.status;
      return acc;
    },
    {} as Record<string, number>
  );

  return res.json({
    success: true,
    data: {
      stats: {
        totalProjects,
        assignedTasks,
        overdueTasks,
        completedTasks: statusMap["DONE"] || 0,
      },
      tasksByStatus: statusMap,
      recentTasks,
      upcomingTasks,
    },
  });
}