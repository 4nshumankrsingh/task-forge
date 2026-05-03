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

  if (project.ownerId !== userId) {
    return res.status(403).json({
      success: false,
      error: "Only the project owner can delete this project.",
    });
  }

  await prisma.project.delete({ where: { id: projectId } });

  return res.json({ success: true, message: "Project deleted." });
}

export async function inviteMember(req: AuthRequest, res: Response) {
  const { projectId } = req.params;
  const { email, role = "MEMBER" } = req.body;
  const senderId = req.user!.userId;

  const userToInvite = await prisma.user.findUnique({ where: { email } });
  if (!userToInvite) {
    return res.status(404).json({ success: false, error: "No user found with that email address." });
  }

  const existingMember = await prisma.teamMember.findUnique({
    where: { userId_projectId: { userId: userToInvite.id, projectId } },
  });
  if (existingMember) {
    return res.status(409).json({ success: false, error: "This user is already a member of the project." });
  }

  const existingInvite = await prisma.invitation.findUnique({
    where: { receiverId_projectId: { receiverId: userToInvite.id, projectId } },
  });
  if (existingInvite && existingInvite.status === "PENDING") {
    return res.status(409).json({ success: false, error: "An invitation has already been sent to this user." });
  }

  const invitation = await prisma.invitation.upsert({
    where: { receiverId_projectId: { receiverId: userToInvite.id, projectId } },
    update: { role, status: "PENDING", senderId },
    create: { senderId, receiverId: userToInvite.id, projectId, role },
    include: {
      sender: { select: { id: true, name: true, email: true } },
      receiver: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true } },
    },
  });

  return res.status(201).json({
    success: true,
    message: `Invitation sent to ${userToInvite.name}.`,
    data: { invitation },
  });
}

export async function getMyInvitations(req: AuthRequest, res: Response) {
  const userId = req.user!.userId;

  const invitations = await prisma.invitation.findMany({
    where: { receiverId: userId, status: "PENDING" },
    include: {
      sender: { select: { id: true, name: true, email: true } },
      project: { select: { id: true, name: true, description: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return res.json({ success: true, data: { invitations } });
}

export async function respondToInvitation(req: AuthRequest, res: Response) {
  const { invitationId } = req.params;
  const { action } = req.body;
  const userId = req.user!.userId;

  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
    include: { project: true },
  });

  if (!invitation) {
    return res.status(404).json({ success: false, error: "Invitation not found." });
  }

  if (invitation.receiverId !== userId) {
    return res.status(403).json({ success: false, error: "This invitation is not for you." });
  }

  if (invitation.status !== "PENDING") {
    return res.status(409).json({ success: false, error: "This invitation has already been responded to." });
  }

  if (action === "accept") {
    await prisma.$transaction([
      prisma.teamMember.create({
        data: { userId, projectId: invitation.projectId, role: invitation.role },
      }),
      prisma.invitation.update({
        where: { id: invitationId },
        data: { status: "ACCEPTED" },
      }),
    ]);
    return res.json({ success: true, message: "Invitation accepted. You are now a member of the project." });
  }

  if (action === "decline") {
    await prisma.invitation.update({
      where: { id: invitationId },
      data: { status: "DECLINED" },
    });
    return res.json({ success: true, message: "Invitation declined." });
  }

  return res.status(400).json({ success: false, error: "Invalid action. Use 'accept' or 'decline'." });
}

export async function removeMember(req: AuthRequest, res: Response) {
  const { projectId, memberId } = req.params;
  const requesterId = req.user!.userId;

  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) {
    return res.status(404).json({ success: false, error: "Project not found." });
  }

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