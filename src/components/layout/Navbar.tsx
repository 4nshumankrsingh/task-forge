import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Settings, User, Check, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/hooks/useAuth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { projectService } from "@/services/project.service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const qc = useQueryClient();
  const [notifOpen, setNotifOpen] = useState(false);

  const { data: invitations = [] } = useQuery({
    queryKey: ["invitations"],
    queryFn: () => projectService.getMyInvitations(),
    refetchInterval: 30_000,
  });

  const handleRespond = async (invitationId: string, action: "accept" | "decline") => {
    try {
      await projectService.respondToInvitation(invitationId, action);
      qc.invalidateQueries({ queryKey: ["invitations"] });
      qc.invalidateQueries({ queryKey: ["projects"] });
      toast.success(action === "accept" ? "Invitation accepted!" : "Invitation declined.");
      if (action === "accept") setNotifOpen(false);
    } catch {
      toast.error("Failed to respond to invitation");
    }
  };

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "TF";

  return (
    <header className="h-14 border-b border-border/60 bg-background/80 backdrop-blur-md sticky top-0 z-50 flex items-center px-4 gap-3">
      <Link to="/dashboard" className="flex items-center mr-4 select-none shrink-0">
        <img src="/logo.png" alt="TaskForge" className="h-7 w-auto object-contain" draggable={false} />
      </Link>

      <nav className="hidden md:flex items-center gap-1 flex-1">
        {[
          { label: "Dashboard", to: "/dashboard" },
          { label: "Projects", to: "/projects" },
          { label: "Team", to: "/team" },
        ].map(({ label, to }) => (
          <Link
            key={to}
            to={to}
            className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors duration-150
              ${location.pathname.startsWith(to)
                ? "bg-primary/10 text-primary"
                : "text-muted-foreground hover:text-foreground hover:bg-accent"
              }`}
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-1 ml-auto">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            className="relative h-9 w-9 rounded-lg flex items-center justify-center
                       text-muted-foreground hover:text-foreground hover:bg-accent
                       transition-colors duration-150"
          >
            <Bell size={17} />
            {invitations.length > 0 && (
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 flex items-center justify-center">
                <span className="text-[8px] text-white font-bold leading-none">
                  {invitations.length > 9 ? "9+" : invitations.length}
                </span>
              </span>
            )}
          </button>

          {notifOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setNotifOpen(false)} />
              <div className="absolute right-0 top-11 z-50 w-80 rounded-xl border border-border bg-popover shadow-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <p className="text-sm font-semibold text-foreground">Notifications</p>
                </div>
                {invitations.length === 0 ? (
                  <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                    No pending invitations
                  </div>
                ) : (
                  <div className="divide-y divide-border max-h-80 overflow-y-auto">
                    {invitations.map((inv) => (
                      <div key={inv.id} className="px-4 py-3">
                        <p className="text-sm text-foreground">
                          <span className="font-medium">{inv.sender.name}</span> invited you to join{" "}
                          <span className="font-medium text-[#208ca2]">{inv.project.name}</span> as{" "}
                          <span className="font-medium">{inv.role.toLowerCase()}</span>
                        </p>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleRespond(inv.id, "accept")}
                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md bg-[#146886] text-white hover:bg-[#208ca2] transition-colors"
                          >
                            <Check size={11} /> Accept
                          </button>
                          <button
                            onClick={() => handleRespond(inv.id, "decline")}
                            className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-md border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
                          >
                            <X size={11} /> Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <ThemeToggle />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg hover:bg-accent transition-colors duration-150">
              <Avatar className="h-7 w-7">
                <AvatarFallback className="bg-primary/15 text-primary text-xs font-semibold">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="hidden sm:block text-sm font-medium text-foreground max-w-25 truncate">
                {user?.name ?? "User"}
              </span>
              <ChevronDown size={14} className="text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <div className="px-3 py-2 border-b border-border/50 mb-1">
              <p className="text-sm font-medium text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
            </div>
            <DropdownMenuItem asChild>
              <Link to="/settings/profile" className="flex items-center gap-2 cursor-pointer">
                <User size={14} /> Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/settings" className="flex items-center gap-2 cursor-pointer">
                <Settings size={14} /> Settings
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={logout}
              className="flex items-center gap-2 text-destructive focus:text-destructive cursor-pointer"
            >
              <LogOut size={14} /> Sign out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}