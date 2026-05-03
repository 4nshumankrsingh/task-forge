import { Response, NextFunction } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types";

// Confirms the user is a member of the project (any role)
export async function requireProjectMember(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { projectId } = req.params;
  const userId = req.user!.userId;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: { members: { where: { userId } } },
  });

  if (!project) {
    return res.status(404).json({ success: false, error: "Project not found." });
  }

  const isOwner = project.ownerId === userId;
  const isMember = project.members.length > 0;

  if (!isOwner && !isMember) {
    return res
      .status(403)
      .json({ success: false, error: "You don't have access to this project." });
  }

  next();
}

// Confirms the user is the project owner or has ADMIN role
export async function requireProjectAdmin(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const { projectId } = req.params;
  const userId = req.user!.userId;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: { where: { userId } },
    },
  });

  if (!project) {
    return res.status(404).json({ success: false, error: "Project not found." });
  }

  const isOwner = project.ownerId === userId;
  const isAdmin =
    project.members.length > 0 && project.members[0].role === "ADMIN";

  if (!isOwner && !isAdmin) {
    return res.status(403).json({
      success: false,
      error: "Only project admins can perform this action.",
    });
  }

  next();
}