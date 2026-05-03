import api from "@/lib/axios";
import type { Task } from "./project.service";

export interface CreateTaskPayload {
  title: string;
  description?: string;
  status?: Task["status"];
  priority?: Task["priority"];
  dueDate?: string;
  assigneeId?: string;
}

export interface UpdateTaskPayload extends Partial<CreateTaskPayload> {}

export interface TaskFilters {
  status?: Task["status"];
  priority?: Task["priority"];
  assigneeId?: string;
}

export const taskService = {
  async getByProject(projectId: string, filters?: TaskFilters): Promise<Task[]> {
    const { data } = await api.get<Task[]>(`/tasks/project/${projectId}`, { params: filters });
    return data;
  },

  async getMyTasks(): Promise<Task[]> {
    const { data } = await api.get<Task[]>("/tasks/me");
    return data;
  },

  async getById(id: string): Promise<Task> {
    const { data } = await api.get<Task>(`/tasks/${id}`);
    return data;
  },

  async create(projectId: string, payload: CreateTaskPayload): Promise<Task> {
    const { data } = await api.post<Task>(`/tasks/project/${projectId}`, payload);
    return data;
  },

  async update(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
    return data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};