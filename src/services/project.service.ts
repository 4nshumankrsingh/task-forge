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
  creator?: { id: string; name: string; email: string };
  project?: { id: string; name: string };
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
    const { data } = await api.get<Project[]>("/projects");
    return data;
  },

  async getById(id: string): Promise<Project> {
    const { data } = await api.get<Project>(`/projects/${id}`);
    return data;
  },

  async create(payload: CreateProjectPayload): Promise<Project> {
    const { data } = await api.post<Project>("/projects", payload);
    return data;
  },

  async update(id: string, payload: UpdateProjectPayload): Promise<Project> {
    const { data } = await api.patch<Project>(`/projects/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/projects/${id}`);
  },

  async inviteMember(projectId: string, email: string, role: "ADMIN" | "MEMBER" = "MEMBER"): Promise<ProjectMember> {
    const { data } = await api.post<ProjectMember>(`/projects/${projectId}/members`, { email, role });
    return data;
  },

  async removeMember(projectId: string, memberId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/members/${memberId}`);
  },

  async updateMemberRole(projectId: string, memberId: string, role: "ADMIN" | "MEMBER"): Promise<ProjectMember> {
    const { data } = await api.patch<ProjectMember>(`/projects/${projectId}/members/${memberId}/role`, { role });
    return data;
  },
};