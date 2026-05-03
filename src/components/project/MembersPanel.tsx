import { useState } from "react";
import { Shield, Crown, User, MoreVertical, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { projectService } from "@/services/project.service";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { Project } from "@/services/project.service";

const ROLE_ICONS: Record<string, React.ElementType> = {
  OWNER: Crown, ADMIN: Shield, MEMBER: User,
};

const ROLE_STYLES: Record<string, string> = {
  OWNER: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  ADMIN: "text-[#146886] bg-[#146886]/10 dark:text-[#57f6e7] dark:bg-[#57f6e7]/10",
  MEMBER: "text-muted-foreground bg-muted",
};

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

export function MembersPanel({
  project, currentUserId, isAdmin, isOwner,
}: {
  project: Project;
  currentUserId: string;
  isAdmin: boolean;
  isOwner: boolean;
}) {
  const qc = useQueryClient();

  const handleRemove = async (memberId: string) => {
    try {
      await projectService.removeMember(project.id, memberId);
      qc.invalidateQueries({ queryKey: ["projects", project.id] });
      toast.success("Member removed");
    } catch {
      toast.error("Failed to remove member");
    }
  };

  const handleRoleChange = async (memberId: string, role: "ADMIN" | "MEMBER") => {
    try {
      await projectService.updateMemberRole(project.id, memberId, role);
      qc.invalidateQueries({ queryKey: ["projects", project.id] });
      toast.success("Role updated");
    } catch {
      toast.error("Failed to update role");
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden max-w-2xl">
      <div className="px-5 py-3 border-b border-border bg-muted/30">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          {project.members?.length ?? 0} Members
        </p>
      </div>
      <div className="divide-y divide-border/60">
        {project.members?.map((member) => {
          const Icon = ROLE_ICONS[member.role] ?? User;
          const isSelf = member.userId === currentUserId;
          const canManage = isAdmin && member.role !== "OWNER" && !isSelf;
          return (
            <div key={member.id} className="flex items-center gap-3 px-5 py-3.5 group hover:bg-muted/20 transition-colors">
              <div className="h-9 w-9 rounded-full bg-linear-to-br from-[#146886] to-[#57f6e7] flex items-center justify-center text-white text-xs font-bold shrink-0">
                {getInitials(member.user.name)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground">
                  {member.user.name} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                </p>
                <p className="text-xs text-muted-foreground truncate">{member.user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide px-2 py-1 rounded-lg", ROLE_STYLES[member.role])}>
                  <Icon size={10} /> {member.role}
                </span>
                {canManage && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical size={13} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="text-xs">
                      {member.role !== "ADMIN" && (
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, "ADMIN")}>
                          Make Admin
                        </DropdownMenuItem>
                      )}
                      {member.role !== "MEMBER" && (
                        <DropdownMenuItem onClick={() => handleRoleChange(member.id, "MEMBER")}>
                          Make Member
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive gap-2"
                        onClick={() => handleRemove(member.id)}
                      >
                        <Trash2 size={11} /> Remove
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}