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

  async inviteMember(projectId: string, email: string, role: "ADMIN" | "MEMBER" = "MEMBER"): Promise<ProjectMember> {
    const { data } = await api.post<any>(`/projects/${projectId}/members`, { email, role });
    return data.data.member ?? data.data;
  },

  async removeMember(projectId: string, memberId: string): Promise<void> {
    await api.delete(`/projects/${projectId}/members/${memberId}`);
  },

  async updateMemberRole(projectId: string, memberId: string, role: "ADMIN" | "MEMBER"): Promise<ProjectMember> {
    const { data } = await api.patch<any>(`/projects/${projectId}/members/${memberId}/role`, { role });
    return data.data.member ?? data.data;
  },
};