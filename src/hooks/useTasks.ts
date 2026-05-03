import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { taskService } from "@/services/task.service";
import type { CreateTaskPayload, UpdateTaskPayload, TaskFilters } from "@/services/task.service";
import { toast } from "sonner";

export function useProjectTasks(projectId: string, filters?: TaskFilters) {
  return useQuery({
    queryKey: ["tasks", "project", projectId, filters],
    queryFn: () => taskService.getByProject(projectId, filters),
    enabled: !!projectId,
  });
}

export function useMyTasks() {
  return useQuery({
    queryKey: ["tasks", "me"],
    queryFn: taskService.getMyTasks,
  });
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ projectId, payload }: { projectId: string; payload: CreateTaskPayload }) =>
      taskService.create(projectId, payload),
    onSuccess: (_, { projectId }) => {
      qc.invalidateQueries({ queryKey: ["tasks", "project", projectId] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task created");
    },
    onError: () => toast.error("Failed to create task"),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateTaskPayload }) =>
      taskService.update(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task updated");
    },
    onError: () => toast.error("Failed to update task"),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => taskService.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["tasks"] });
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      toast.success("Task deleted");
    },
    onError: () => toast.error("Failed to delete task"),
  });
}