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

interface BackendResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

interface TasksWrapper {
  tasks: Task[];
}

export const taskService = {
  async getByProject(projectId: string, filters?: TaskFilters): Promise<Task[]> {
    const { data } = await api.get<BackendResponse<TasksWrapper>>(`/tasks/project/${projectId}`, { params: filters });
    return data.data.tasks;
  },

  async getMyTasks(): Promise<Task[]> {
    const { data } = await api.get<BackendResponse<TasksWrapper>>("/tasks/me");
    return data.data.tasks;
  },

async getById(id: string): Promise<Project> {
  const { data } = await api.get<BackendResponse<Project>>(`/projects/${id}`);
  console.log("getById raw data.data:", data.data);
  return data.data;
},

  async create(projectId: string, payload: CreateTaskPayload): Promise<Task> {
    const { data } = await api.post<BackendResponse<Task>>(`/tasks/project/${projectId}`, payload);
    return data.data;
  },

  async update(id: string, payload: UpdateTaskPayload): Promise<Task> {
    const { data } = await api.patch<BackendResponse<Task>>(`/tasks/${id}`, payload);
    return data.data;
  },

  async remove(id: string): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },
};