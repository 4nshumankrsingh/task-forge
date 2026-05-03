import api from "@/lib/axios";
import type { Task } from "./project.service";

export interface DashboardStats {
  totalProjects: number;
  assignedTasks: number;
  overdueTasks: number;
  completedTasks: number;
  tasksByStatus: {
    TODO: number;
    IN_PROGRESS: number;
    IN_REVIEW: number;
    DONE: number;
  };
  recentTasks: Task[];
  upcomingTasks: Task[];
}

interface BackendResponse {
  success: boolean;
  message: string;
  data: DashboardStats;
}

export const dashboardService = {
  async getStats(): Promise<DashboardStats> {
    const { data } = await api.get<BackendResponse>("/dashboard");
    return data.data;
  },
};