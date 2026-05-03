import { useState } from "react";
import { Link } from "react-router-dom";
import { useProjects, useCreateProject, useDeleteProject } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import {
  Plus, FolderKanban, Users, ListTodo, MoreVertical, Trash2, ExternalLink, Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import type { Project } from "@/services/project.service";

const STATUS_BADGE: Record<string, string> = {
  ACTIVE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  ON_HOLD: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  COMPLETED: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
  ARCHIVED: "bg-muted text-muted-foreground",
};

const createSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().optional(),
});

type CreateForm = z.infer<typeof createSchema>;

function ProjectCard({ project, onDelete, isOwner }: { project: Project; onDelete: () => void; isOwner: boolean }) {
  return (
    <div className="group rounded-2xl border border-border bg-card p-5 flex flex-col gap-4 hover:border-[#208ca2]/40 hover:shadow-sm transition-all duration-200">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <Link
            to={`/projects/${project.id}`}
            className="text-base font-semibold text-foreground hover:text-[#208ca2] transition-colors truncate block"
          >
            {project.name}
          </Link>
          {project.description && (
            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{project.description}</p>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <MoreVertical size={14} />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to={`/projects/${project.id}`} className="flex items-center gap-2">
                <ExternalLink size={13} /> Open Project
              </Link>
            </DropdownMenuItem>
            {isOwner && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={onDelete}
                  className="text-destructive focus:text-destructive flex items-center gap-2"
                >
                  <Trash2 size={13} /> Delete Project
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center justify-between">
        <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-lg", STATUS_BADGE[project.status])}>
          {project.status.replace("_", " ")}
        </span>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Users size={11} /> {project.members?.length ?? 0}
          </span>
          <span className="flex items-center gap-1">
            <ListTodo size={11} /> {project._count?.tasks ?? project.tasks?.length ?? 0}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-muted-foreground border-t border-border pt-3 mt-auto">
        Created {format(new Date(project.createdAt), "MMM d, yyyy")}
      </p>
    </div>
  );
}

export default function Projects() {
  const { data: projects, isLoading } = useProjects();
  const { mutate: createProject, isPending } = useCreateProject();
  const { mutate: deleteProject } = useDeleteProject();
  const { user } = useAuth();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);

  const { register, handleSubmit, reset, formState: { errors } } = useForm<CreateForm>({
    resolver: zodResolver(createSchema),
  });

  const filtered = projects?.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const onSubmit = (data: CreateForm) => {
    createProject(data, {
      onSuccess: () => {
        setOpen(false);
        reset();
      },
    });
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {projects?.length ?? 0} project{(projects?.length ?? 0) !== 1 ? "s" : ""} in your workspace
          </p>
        </div>
        <Button
          onClick={() => setOpen(true)}
          className="gap-2 bg-[#146886] hover:bg-[#208ca2] text-white shrink-0"
        >
          <Plus size={15} /> New Project
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 text-sm"
        />
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-44 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <FolderKanban size={40} className="mb-3 opacity-20" />
          <p className="font-medium">{search ? "No projects match your search" : "No projects yet"}</p>
          {!search && (
            <Button
              variant="outline"
              className="mt-4 gap-2 text-[#208ca2] border-[#208ca2]/30"
              onClick={() => setOpen(true)}
            >
              <Plus size={14} /> Create your first project
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isOwner={project.ownerId === user?.id}
              onDelete={() => setDeleteTarget(project.id)}
            />
          ))}
        </div>
      )}

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
            <DialogDescription>Give your project a name and optional description.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Project Name</label>
              <Input {...register("name")} placeholder="e.g. Q4 Product Launch" />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium">Description <span className="text-muted-foreground font-normal">(optional)</span></label>
              <textarea
                {...register("description")}
                placeholder="What's this project about?"
                rows={3}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="button" variant="outline" onClick={() => { setOpen(false); reset(); }}>
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} className="bg-[#146886] hover:bg-[#208ca2] text-white">
                {isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this project?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project and all its tasks. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { if (deleteTarget) deleteProject(deleteTarget); setDeleteTarget(null); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}