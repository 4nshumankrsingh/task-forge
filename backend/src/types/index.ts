import { Request } from "express";
import { MemberRole } from "@prisma/client";

export interface AuthPayload {
  userId: string;
  email: string;
}

export interface AuthRequest extends Request {
  user?: AuthPayload;
}

export interface ProjectMemberContext {
  userId: string;
  projectId: string;
  role: MemberRole;
}

export interface PaginationQuery {
  page?: string;
  limit?: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}