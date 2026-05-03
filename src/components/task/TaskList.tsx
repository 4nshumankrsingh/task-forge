import { Pencil, Trash2, CalendarDays, UserCircle, AlertCircle } from "lucide-react";
import { format, isPast } from "date-fns";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import type { Task, ProjectMember } from "@/services/project.service";

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400",
  MEDIUM: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  HIGH: "text-orange-600 bg-orange-100 dark:bg-orange-900/30 dark:text-orange-400",
  URGENT: "text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400",
};

interface TaskListProps {
  tasks: Task[];
  members: ProjectMember[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task["status"]) => void;
}

export function TaskList({ tasks, onEdit, onDelete, onStatusChange }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <div className="flex flex-col items-center py-16 text-muted-foreground rounded-2xl border border-dashed border-border">
        <p className="text-sm">No tasks yet — add one to get started.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-muted/40">
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Task</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden md:table-cell">Assignee</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden sm:table-cell">Priority</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground hidden lg:table-cell">Due</th>
            <th className="px-4 py-3 w-20" />
          </tr>
        </thead>
        <tbody>
          {tasks.map((task) => {
            const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "DONE";
            return (
              <tr key={task.id} className="border-b border-border/60 last:border-0 hover:bg-muted/20 transition-colors group">
                <td className="px-4 py-3">
                  <p className="font-medium text-foreground">{task.title}</p>
                  {task.description && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{task.description}</p>
                  )}
                </td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {task.assignee ? (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <UserCircle size={13} /> {task.assignee.name}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={cn("text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-md", PRIORITY_STYLES[task.priority])}>
                    {task.priority}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Select value={task.status} onValueChange={(v) => onStatusChange(task.id, v as Task["status"])}>
                    <SelectTrigger className="h-7 w-28 text-[11px] border-0 bg-muted px-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="TODO" className="text-xs">To Do</SelectItem>
                      <SelectItem value="IN_PROGRESS" className="text-xs">In Progress</SelectItem>
                      <SelectItem value="IN_REVIEW" className="text-xs">In Review</SelectItem>
                      <SelectItem value="DONE" className="text-xs">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </td>
                <td className="px-4 py-3 hidden lg:table-cell">
                  {task.dueDate ? (
                    <span className={cn("flex items-center gap-1 text-xs", isOverdue ? "text-red-500 font-medium" : "text-muted-foreground")}>
                      {isOverdue && <AlertCircle size={11} />}
                      <CalendarDays size={11} />
                      {format(new Date(task.dueDate), "MMM d, yyyy")}
                    </span>
                  ) : (
                    <span className="text-xs text-muted-foreground/40">—</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onEdit(task)}>
                      <Pencil size={12} />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:text-destructive" onClick={() => onDelete(task.id)}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}