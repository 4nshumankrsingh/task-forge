import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2, UserCircle, CalendarDays } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, isPast } from "date-fns";
import type { Task } from "@/services/project.service";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const COLUMNS = [
  { id: "TODO", label: "To Do", color: "#94a3b8" },
  { id: "IN_PROGRESS", label: "In Progress", color: "#208ca2" },
  { id: "IN_REVIEW", label: "In Review", color: "#57f6e7" },
  { id: "DONE", label: "Done", color: "#22c55e" },
] as const;

const PRIORITY_DOT: Record<string, string> = {
  LOW: "bg-emerald-400",
  MEDIUM: "bg-amber-400",
  HIGH: "bg-orange-500",
  URGENT: "bg-red-500",
};

interface KanbanBoardProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onStatusChange: (id: string, status: Task["status"]) => void;
}

function TaskCard({ task, onEdit, onDelete, onStatusChange }: {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onStatusChange: (status: Task["status"]) => void;
}) {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "DONE";

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("taskId", task.id)}
      className="group rounded-xl border border-border bg-card p-3.5 cursor-grab active:cursor-grabbing hover:shadow-sm hover:border-[#208ca2]/30 transition-all duration-150 space-y-2.5"
    >
      <div className="flex items-start gap-2">
        <div className={cn("h-2 w-2 rounded-full mt-1.5 shrink-0", PRIORITY_DOT[task.priority])} />
        <p className="text-sm font-medium text-foreground flex-1 leading-snug">{task.title}</p>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100 -mr-1 shrink-0">
              <MoreHorizontal size={13} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="text-xs">
            <DropdownMenuItem onClick={onEdit} className="gap-2"><Pencil size={12} /> Edit</DropdownMenuItem>
            <DropdownMenuSeparator />
            {COLUMNS.filter(c => c.id !== task.status).map(c => (
              <DropdownMenuItem key={c.id} onClick={() => onStatusChange(c.id)} className="gap-2">
                Move to {c.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive focus:text-destructive">
              <Trash2 size={12} /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {task.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 pl-4">{task.description}</p>
      )}

      <div className="flex items-center justify-between pl-4 gap-2">
        {task.assignee && (
          <span className="flex items-center gap-1 text-[10px] text-muted-foreground truncate">
            <UserCircle size={11} /> {task.assignee.name.split(" ")[0]}
          </span>
        )}
        {task.dueDate && (
          <span className={cn("flex items-center gap-1 text-[10px] ml-auto", isOverdue ? "text-red-500 font-medium" : "text-muted-foreground")}>
            <CalendarDays size={10} />
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}
      </div>
    </div>
  );
}

export function KanbanBoard({ tasks, onEdit, onDelete, onStatusChange }: KanbanBoardProps) {
  const [dragOver, setDragOver] = useState<string | null>(null);

  const handleDrop = (e: React.DragEvent, colId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) onStatusChange(taskId, colId as Task["status"]);
    setDragOver(null);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 min-h-100">
      {COLUMNS.map((col) => {
        const colTasks = tasks.filter((t) => t.status === col.id);
        return (
          <div
            key={col.id}
            onDragOver={(e) => { e.preventDefault(); setDragOver(col.id); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={(e) => handleDrop(e, col.id)}
            className={cn(
              "rounded-2xl border-2 p-3 flex flex-col gap-2 transition-colors duration-150 min-h-50",
              dragOver === col.id
                ? "border-dashed border-[#208ca2] bg-[#208ca2]/5"
                : "border-border bg-muted/30"
            )}
          >
            <div className="flex items-center justify-between px-1 mb-1">
              <div className="flex items-center gap-2">
                <div className="h-2 w-2 rounded-full" style={{ background: col.color }} />
                <span className="text-xs font-semibold text-foreground">{col.label}</span>
              </div>
              <span className="text-[10px] text-muted-foreground font-medium bg-background rounded-full px-2 py-0.5 border border-border">
                {colTasks.length}
              </span>
            </div>

            {colTasks.length === 0 && (
              <div className="flex-1 flex items-center justify-center">
                <p className="text-xs text-muted-foreground/50 italic">Drop tasks here</p>
              </div>
            )}

            {colTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={() => onEdit(task)}
                onDelete={() => onDelete(task.id)}
                onStatusChange={(status) => onStatusChange(task.id, status)}
              />
            ))}
          </div>
        );
      })}
    </div>
  );
}