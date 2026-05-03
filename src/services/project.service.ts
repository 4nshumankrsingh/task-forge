import api from "@/lib/axios";

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: "ACTIVE" | "ON_HOLD" | "COMPLETED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  ownerId: string;
  members: ProjectMember[];
  tasks?: Task[];
  _count?: { tasks: number; members: number };
}

export interface ProjectMember {
  id: string;
  userId: string;
  projectId: string;
  role: "OWNER" | "ADMIN" | "MEMBER";
  user: { id: string; name: string; email: string };
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "DONE";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  dueDate?: string;
  projectId: string;
  assigneeId?: string;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  assignee?: { id: string; name: string; email: string };
  creator?: { id: true; name: string; email: string };
  project?: { id: string; name: string };
}

export interface Invitation {
  id: string;
  role: "ADMIN" | "MEMBER";
  status: "PENDING" | "ACCEPTED" | "DECLINED";
  createdAt: string;
  sender: { id: string; name: string; email: string };
  project: { id: string; name: string; description?: string };
}

export interface CreateProjectPayload {
  name: string;
  description?: string;
}

export interface UpdateProjectPayload {
  name?: string;
  description?: string;
  status?: Project["status"];
}

export const projectService = {
  async getAll(): Promise<Project[]> {
    const { data } = await api.get<any>("/projects");
    return data.data.projects;
  },

  async getById(id: string): Promise<Project> {
    const { data } = await api.get<any>(`/projects/${id}`);
    return data.data.project;
  },

  async create(payload: CreateProjectPayload): Promise<Project> {
    const { data } = await api.post<any>("/projects", payload);
    return data.data.project ?? data.data;
  },

  async update(id: string, payload: UpdateProjectPayload): Promise<Project> {
    const { data } = await api.patch<any>(`/projects/${id}`, payload);
    return data.data.project ?? data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async inviteMember(projectId: string, email: string, role: "ADMIN" | "MEMBER" = "MEMBER"): Promise<void> {
    await api.post<any>(`/projects/${projectId}/members`, { email, role });
  },

  async removeMember(projectId: string, userId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/members/${userId}`);
  },

  async updateMemberRole(projectId: string, userId: string, role: "ADMIN" | "MEMBER"): Promise<void> {
    await api.patch<any>(`/projects/${projectId}/members/${userId}/role`, { role });
  },

  async getMyInvitations(): Promise<Invitation[]> {
    const { data } = await api.get<any>("/projects/invitations");
    return data.data.invitations;
  },

  async respondToInvitation(invitationId: string, action: "accept" | "decline"): Promise<void> {
    await api.post(`/projects/invitations/${invitationId}/respond`, { action });
  },
};