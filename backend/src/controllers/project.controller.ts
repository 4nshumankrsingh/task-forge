import { Response } from "express";
import { prisma } from "../lib/prisma";
import { AuthRequest } from "../types";

export async function createProject(req: AuthRequest, res: Response) {
  const { name, description } = req.body;
  const userId = req.user!.userId;

  const project = await prisma.project.create({
    data: {
      name,
      description,
      ownerId: userId,
      // Owner is automatically added as ADMIN member
      members: {
        create: { userId, role: "ADMIN" },
      },
    },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      },
      _count: { select: { tasks: true } },
    },
  });

  return res.status(201).json({
    success: true,
    message: "Project created successfully.",
    data: { project },
  });
}

export async function getProjects(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: userId }, { members: { some: { userId } } }],
    },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      },
      _count: { select: { tasks: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ success: true, data: { projects } });
}

export async function getProjectById(req: AuthRequest, res: Response) {
  const { projectId } = req.params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      members: {
        include: {
          user: { select: { id: true, name: true, email: true, avatar: true } },
        },
      },
      tasks: {
        include: {
          assignee: { select: { id: true, name: true, email: true, avatar: true } },
          creator: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    return res.status(404).json({ success: false, error: "Project not found." });
  }

  return res.json({ success: true, data: { project } });
}

export async function updateProject(req: AuthRequest, res: Response) {
  const { projectId } = req.params;
  const { name, description, status } = req.body;

  const project = await prisma.project.update({
    where: { id: projectId },
    data: { name, description, status },
    include: {
      owner: { select: { id: true, name: true, email: true, avatar: true } },
      _count: { select: { tasks: true } },
    },
  });

  return res.json({
    success: true,
    message: "Project updated.",
    data: { project },
  });
}

export async function deleteProject(req: AuthRequest, res: Response) {
  const { projectId } = req.params;
  const userId = req.user!.userId;

  const project = await prisma.project.findUnique({ where: { id: projectId } });

  if (!project) {
    return res.status(404).json({ success: false, error: "Project not found." });
  }

  // Only the owner can delete
  if (project.ownerId !== userId) {
    return res.status(403).json({
      success: false,
      error: "Only the project owner can delete this project.",
    });
  }

  await prisma.project.delete({ where: { id: projectId } });

  return res.json({ success: true, message: "Project deleted." });
}

export async function addMember(req: AuthRequest, res: Response) {
  const { projectId } = req.params;
  const { email, role = "MEMBER" } = req.body;

  const userToAdd = await prisma.user.findUnique({ where: { email } });
  if (!userToAdd) {
    return res
      .status(404)
      .json({ success: false, error: "No user found with that email address." });
  }

  const existing = await prisma.teamMember.findUnique({
    where: { userId_projectId: { userId: userToAdd.id, projectId } },
  });

  if (existing) {
    return res
      .status(409)
      .json({ success: false, error: "This user is already a member of the project." });
  }

  const member = await prisma.teamMember.create({
    data: { userId: userToAdd.id, projectId, role },
    include: {
      user: { select: { id: true, name: true, email: true, avatar: true } },
    },
  });

  return res.status(201).json({
    success: true,
    message: `${userToAdd.name} added to the project.`,
    data: { member },
  });
}

export async function removeMember(req: AuthRequest, res: Response) {
  const { projectId, memberId } = req.params;
  const requesterId = req.user!.userId;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return res.status(404).json({ success: false, error: "Project not found." });
  }

  // A member can remove themselves; owner/admin can remove anyone
  const isOwner = project.ownerId === requesterId;
  const isSelf = memberId === requesterId;

  if (!isOwner && !isSelf) {
    const requesterMembership = await prisma.teamMember.findUnique({
      where: { userId_projectId: { userId: requesterId, projectId } },
    });
    if (!requesterMembership || requesterMembership.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: "You don't have permission to remove this member.",
      });
    }
  }

  await prisma.teamMember.delete({
    where: { userId_projectId: { userId: memberId, projectId } },
  });

  return res.json({ success: true, message: "Member removed from project." });
}

export async function updateMemberRole(req: AuthRequest, res: Response) {
  const { projectId, memberId } = req.params;
  const { role } = req.body;

  const member = await prisma.teamMember.update({
    where: { userId_projectId: { userId: memberId, projectId } },
    data: { role },
    include: {
      user: { select: { id: true, name: true, email: true } },
    },
  });

  return res.json({
    success: true,
    message: "Member role updated.",
    data: { member },
  });
}