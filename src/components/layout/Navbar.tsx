import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Bell, ChevronDown, LogOut, Settings, User } from "lucide-react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [notifOpen, setNotifOpen] = useState(false);

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "TF";

  return (
    <header className="h-14 border-b border-border/60 bg-background/80 backdrop-blur-md
                       sticky top-0 z-50 flex items-center px-4 gap-3">
      {/* Logo */}
      <Link
        to="/dashboard"
        className="flex items-center gap-2 select-none mr-4 group"
      >
        <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center
                        shadow-sm group-hover:shadow-primary/30 transition-shadow duration-200">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M2 3h4v4H2zM8 3h4v2H8zM8 7h4v4H8zM2 9h4v2H2z"
              fill="white"
              fillOpacity="0.95"
            />
          </svg>
        </div>
        <span className="font-semibold text-[15px] tracking-tight text-foreground">
          Task<span className="text-primary">Forge</span>
        </span>
      </Link>

      {/* Nav links — hidden on small screens, shown md+ */}
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
        <button
          onClick={() => setNotifOpen(!notifOpen)}
          aria-label="Notifications"
          className="relative h-9 w-9 rounded-lg flex items-center justify-center
                     text-muted-foreground hover:text-foreground hover:bg-accent
                     transition-colors duration-150
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          <Bell size={17} />
          <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-accent-teal" />
        </button>

        <ThemeToggle />

        {/* User menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg
                               hover:bg-accent transition-colors duration-150
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50">
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