import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { prisma } from "../lib/prisma";
import { signToken } from "../utils/jwt";
import { AuthRequest } from "../types";

export async function register(req: Request, res: Response) {
  const { name, email, password } = req.body;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return res
      .status(409)
      .json({ success: false, error: "An account with this email already exists." });
  }

  const hashed = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password: hashed },
    select: { id: true, name: true, email: true, avatar: true, createdAt: true },
  });

  const token = signToken({ userId: user.id, email: user.email });

  return res.status(201).json({
    success: true,
    message: "Account created successfully.",
    data: { user, token },
  });
}

export async function login(req: Request, res: Response) {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid email or password." });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res
      .status(401)
      .json({ success: false, error: "Invalid email or password." });
  }

  const token = signToken({ userId: user.id, email: user.email });

  const { password: _pw, ...safeUser } = user;

  return res.json({
    success: true,
    message: "Logged in successfully.",
    data: { user: safeUser, token },
  });
}

export async function getMe(req: AuthRequest, res: Response) {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: { id: true, name: true, email: true, avatar: true, createdAt: true },
  });

  if (!user) {
    return res.status(404).json({ success: false, error: "User not found." });
  }

  return res.json({ success: true, data: { user } });
}

export async function updateProfile(req: AuthRequest, res: Response) {
  const { name, avatar } = req.body;

  const user = await prisma.user.update({
    where: { id: req.user!.userId },
    data: { name, avatar },
    select: { id: true, name: true, email: true, avatar: true, updatedAt: true },
  });

  return res.json({
    success: true,
    message: "Profile updated.",
    data: { user },
  });
}