import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useProject, useUpdateProject, useInviteMember, useDeleteProject } from "@/hooks/useProjects";
import { useProjectTasks, useCreateTask, useUpdateTask, useDeleteTask } from "@/hooks/useTasks";
import { useAuth } from "@/hooks/useAuth";
import {
  ArrowLeft, Plus, Users, Settings, Trash2, UserPlus,
  LayoutGrid, List, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TaskModal } from "@/components/task/TaskModal";
import { KanbanBoard } from "@/components/task/KanbanBoard";
import { TaskList } from "@/components/task/TaskList";
import { MembersPanel } from "@/components/project/MembersPanel";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import type { Task } from "@/services/project.service";

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active", ON_HOLD: "On Hold", COMPLETED: "Completed", ARCHIVED: "Archived",
};

const inviteSchema = z.object({
  email: z.string().email("Enter a valid email"),
  role: z.enum(["ADMIN", "MEMBER"]),
});
type InviteForm = z.infer<typeof inviteSchema>;

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: project, isLoading } = useProject(id!);
  const { data: tasks = [], isLoading: tasksLoading } = useProjectTasks(id!);
  const { mutate: updateProject } = useUpdateProject();
  const { mutate: deleteProject } = useDeleteProject();
  const { mutate: inviteMember, isPending: inviting } = useInviteMember();
  const { mutate: createTask } = useCreateTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteTask } = useDeleteTask();

  const [taskModalOpen, setTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [view, setView] = useState<"kanban" | "list">("kanban");

  const myMember = project?.members?.find((m) => m.userId === user?.id);
  const isAdmin = myMember?.role === "OWNER" || myMember?.role === "ADMIN";
  const isOwner = project?.ownerId === user?.id;

  const {
    register, handleSubmit, reset, setValue, formState: { errors },
  } = useForm<InviteForm>({ resolver: zodResolver(inviteSchema), defaultValues: { role: "MEMBER" } });

  const onInvite = (data: InviteForm) => {
    inviteMember({ projectId: id!, ...data }, {
      onSuccess: () => { setInviteOpen(false); reset(); },
    });
  };

  const handleTaskSave = (data: any) => {
    if (editingTask) {
      updateTask({ id: editingTask.id, payload: data });
    } else {
      createTask({ projectId: id!, payload: data });
    }
    setTaskModalOpen(false);
    setEditingTask(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-5">
        <Skeleton className="h-8 w-48 rounded-xl" />
        <Skeleton className="h-5 w-72 rounded-xl" />
        <Skeleton className="h-96 rounded-2xl" />
      </div>
    );
  }

  if (!project) return (
    <div className="text-center py-20 text-muted-foreground">Project not found.</div>
  );

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <Button
          variant="ghost"
          size="sm"
          className="self-start gap-1.5 text-muted-foreground hover:text-foreground -ml-1"
          onClick={() => navigate("/projects")}
        >
          <ArrowLeft size={14} /> Projects
        </Button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
              {isAdmin && (
                <Select
                  value={project.status}
                  onValueChange={(v) => updateProject({ id: id!, payload: { status: v as any } })}
                >
                  <SelectTrigger className="h-6 w-auto text-[10px] font-bold uppercase tracking-wide gap-1 border-0 px-2 bg-muted rounded-lg">
                    <SelectValue />
                    <ChevronDown size={10} />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_LABELS).map(([v, l]) => (
                      <SelectItem key={v} value={v} className="text-xs">{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
            {project.description && (
              <p className="mt-1 text-sm text-muted-foreground max-w-lg">{project.description}</p>
            )}
            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              <span>{tasks.length} task{tasks.length !== 1 ? "s" : ""}</span>
              <span>·</span>
              <span>{project.members?.length ?? 0} member{(project.members?.length ?? 1) !== 1 ? "s" : ""}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {isAdmin && (
              <Button
                size="sm"
                variant="outline"
                className="gap-1.5 text-xs border-[#208ca2]/30 text-[#208ca2]"
                onClick={() => setInviteOpen(true)}
              >
                <UserPlus size={13} /> Invite
              </Button>
            )}
            <Button
              size="sm"
              className="gap-1.5 text-xs bg-[#146886] hover:bg-[#208ca2] text-white"
              onClick={() => { setEditingTask(null); setTaskModalOpen(true); }}
            >
              <Plus size={13} /> Add Task
            </Button>
            {isOwner && (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1.5 text-xs text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 size={13} />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tasks">
        <div className="flex items-center justify-between gap-4">
          <TabsList className="h-9">
            <TabsTrigger value="tasks" className="text-xs gap-1.5">
              <LayoutGrid size={13} /> Tasks
            </TabsTrigger>
            <TabsTrigger value="members" className="text-xs gap-1.5">
              <Users size={13} /> Members
            </TabsTrigger>
          </TabsList>

          <div className="flex items-center border border-border rounded-lg overflow-hidden h-8 text-xs">
            <button
              className={cn("px-3 h-full flex items-center gap-1 transition-colors", view === "kanban" ? "bg-[#146886] text-white" : "text-muted-foreground hover:bg-muted")}
              onClick={() => setView("kanban")}
            >
              <LayoutGrid size={12} /> Board
            </button>
            <button
              className={cn("px-3 h-full flex items-center gap-1 transition-colors", view === "list" ? "bg-[#146886] text-white" : "text-muted-foreground hover:bg-muted")}
              onClick={() => setView("list")}
            >
              <List size={12} /> List
            </button>
          </div>
        </div>

        <TabsContent value="tasks" className="mt-5">
          {tasksLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
            </div>
          ) : view === "kanban" ? (
            <KanbanBoard
              tasks={tasks}
              members={project.members}
              onEdit={(t) => { setEditingTask(t); setTaskModalOpen(true); }}
              onDelete={(id) => deleteTask(id)}
              onStatusChange={(taskId, status) => updateTask({ id: taskId, payload: { status } })}
            />
          ) : (
            <TaskList
              tasks={tasks}
              members={project.members}
              onEdit={(t) => { setEditingTask(t); setTaskModalOpen(true); }}
              onDelete={(id) => deleteTask(id)}
              onStatusChange={(taskId, status) => updateTask({ id: taskId, payload: { status } })}
            />
          )}
        </TabsContent>

        <TabsContent value="members" className="mt-5">
          <MembersPanel
            project={project}
            currentUserId={user?.id ?? ""}
            isAdmin={isAdmin}
            isOwner={isOwner}
          />
        </TabsContent>
      </Tabs>

      {/* Task Modal */}
      <TaskModal
        open={taskModalOpen}
        onClose={() => { setTaskModalOpen(false); setEditingTask(null); }}
        onSave={handleTaskSave}
        task={editingTask}
        members={project.members}
      />

      {/* Invite Dialog */}
      <Dialog open={inviteOpen} onOpenChange={setInviteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onInvite)} className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Email Address</label>
              <Input {...register("email")} type="email" placeholder="colleague@company.com" />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Role</label>
              <Select defaultValue="MEMBER" onValueChange={(v) => setValue("role", v as any)}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Member</SelectItem>
                  <SelectItem value="ADMIN">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <Button type="button" variant="outline" onClick={() => { setInviteOpen(false); reset(); }}>Cancel</Button>
              <Button type="submit" disabled={inviting} className="bg-[#146886] hover:bg-[#208ca2] text-white">
                {inviting ? "Inviting..." : "Send Invite"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Project Confirm */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete "{project.name}"?</AlertDialogTitle>
            <AlertDialogDescription>
              All tasks and member associations will be permanently removed. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { deleteProject(id!); navigate("/projects"); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}