import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  ChevronLeft,
  ChevronRight,
  Settings,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: FolderKanban, label: "Projects", to: "/projects" },
  { icon: Users, label: "Team", to: "/team" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <aside
      className={cn(
        "hidden md:flex flex-col border-r border-border/60 bg-background",
        "transition-all duration-250 ease-in-out shrink-0",
        collapsed ? "w-14" : "w-56"
      )}
    >
      <div className="flex flex-col gap-1 flex-1 py-3 px-2 overflow-hidden">
        {/* New project shortcut */}
        {!collapsed ? (
          <Link
            to="/projects/new"
            className="flex items-center gap-2 px-3 py-2 mb-2 rounded-md
                       bg-primary text-white text-sm font-medium
                       hover:bg-primary/90 transition-colors duration-150 shadow-sm"
          >
            <Plus size={15} />
            <span>New Project</span>
          </Link>
        ) : (
          <Link
            to="/projects/new"
            aria-label="New Project"
            className="flex items-center justify-center h-8 w-8 mx-auto mb-2 rounded-md
                       bg-primary text-white hover:bg-primary/90
                       transition-colors duration-150"
          >
            <Plus size={15} />
          </Link>
        )}

        {/* Nav links */}
        {navItems.map(({ icon: Icon, label, to }) => {
          const active = location.pathname.startsWith(to);
          return (
            <Link
              key={to}
              to={to}
              title={collapsed ? label : undefined}
              className={cn(
                "flex items-center gap-3 px-2.5 py-2 rounded-md text-sm font-medium",
                "transition-colors duration-150 group relative",
                active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-accent"
              )}
            >
              <Icon size={16} className="shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
              {active && (
                <span className="absolute left-0 top-1 bottom-1 w-0.5 rounded-r-full bg-primary" />
              )}
            </Link>
          );
        })}
      </div>

      {/* Collapse toggle */}
      <div className="p-2 border-t border-border/50">
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center justify-center h-8 w-full rounded-md
                     text-muted-foreground hover:text-foreground hover:bg-accent
                     transition-colors duration-150"
        >
          {collapsed ? <ChevronRight size={15} /> : <ChevronLeft size={15} />}
          {!collapsed && <span className="ml-2 text-xs">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}