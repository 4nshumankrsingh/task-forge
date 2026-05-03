import { useProjects } from "@/hooks/useProjects";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { Crown, Shield, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const ROLE_BADGE: Record<string, string> = {
  OWNER: "text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400",
  ADMIN: "text-[#146886] bg-[#146886]/10 dark:text-[#57f6e7] dark:bg-[#57f6e7]/10",
  MEMBER: "text-muted-foreground bg-muted",
};

const ROLE_ICONS: Record<string, React.ElementType> = {
  OWNER: Crown, ADMIN: Shield, MEMBER: User,
};

export default function Team() {
  const { data: projects, isLoading } = useProjects();
  const { user } = useAuth();

  // Flatten all unique members across all projects
  const membersMap = new Map<string, { user: any; projects: string[]; role: string }>();
  projects?.forEach((project) => {
    project.members?.forEach((m) => {
      if (!membersMap.has(m.userId)) {
        membersMap.set(m.userId, { user: m.user, projects: [project.name], role: m.role });
      } else {
        membersMap.get(m.userId)!.projects.push(project.name);
      }
    });
  });

  const members = Array.from(membersMap.values());

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Team</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Everyone across your projects — {members.length} member{members.length !== 1 ? "s" : ""}
        </p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-36 rounded-2xl" />)}
        </div>
      ) : members.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-muted-foreground">
          <User size={36} className="opacity-20 mb-3" />
          <p className="text-sm font-medium">No team members yet</p>
          <p className="text-xs mt-1">Create a project and invite collaborators.</p>
          <Link to="/projects" className="mt-4 text-xs text-[#208ca2] hover:underline">
            Go to Projects →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {members.map(({ user: u, projects: ps, role }) => {
            const Icon = ROLE_ICONS[role] ?? User;
            const isSelf = u.id === user?.id;
            return (
              <div key={u.id} className="rounded-2xl border border-border bg-card p-5 hover:border-[#208ca2]/30 hover:shadow-sm transition-all duration-200">
                <div className="flex items-start gap-3">
                  <div className="h-11 w-11 rounded-full bg-linear-to-br from-[#146886] to-[#57f6e7] flex items-center justify-center text-white font-bold text-sm shrink-0">
                    {getInitials(u.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground text-sm truncate">
                      {u.name} {isSelf && <span className="text-xs text-muted-foreground">(you)</span>}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                    <span className={cn("inline-flex items-center gap-1 mt-1.5 text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md", ROLE_BADGE[role])}>
                      <Icon size={9} /> {role}
                    </span>
                  </div>
                </div>
                <div className="mt-3 pt-3 border-t border-border/60">
                  <p className="text-[10px] text-muted-foreground font-medium mb-1.5">Projects</p>
                  <div className="flex flex-wrap gap-1">
                    {ps.slice(0, 3).map((name) => (
                      <span key={name} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md truncate max-w-30">
                        {name}
                      </span>
                    ))}
                    {ps.length > 3 && (
                      <span className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-md">
                        +{ps.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}