import { useDashboard } from "@/hooks/useDashboard";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";
import { format, isPast } from "date-fns";
import {
  FolderKanban, CheckSquare, AlertCircle, TrendingUp,
  ArrowRight, Clock, CalendarDays, CircleDot
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { cn } from "@/lib/utils";

const PRIORITY_STYLES: Record<string, string> = {
  LOW: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
  MEDIUM: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
  HIGH: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
  URGENT: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_COLORS: Record<string, string> = {
  TODO: "#94a3b8",
  IN_PROGRESS: "#208ca2",
  IN_REVIEW: "#57f6e7",
  DONE: "#22c55e",
};

function StatCard({
  icon: Icon, label, value, sub, color,
}: {
  icon: React.ElementType;
  label: string;
  value: number | string;
  sub?: string;
  color: string;
}) {
  return (
    <div className="relative rounded-2xl border border-border bg-card p-5 overflow-hidden group transition-shadow hover:shadow-md">
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `radial-gradient(ellipse at top right, ${color}12, transparent 70%)` }}
      />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground font-medium tracking-wide">{label}</p>
          <p className="mt-1.5 text-3xl font-bold text-foreground tabular-nums">{value}</p>
          {sub && <p className="mt-1 text-xs text-muted-foreground">{sub}</p>}
        </div>
        <div
          className="h-10 w-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ background: `${color}22`, color }}
        >
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

function TaskRow({ task }: { task: any }) {
  const isOverdue = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== "DONE";
  return (
    <div className="flex items-center gap-3 py-3 border-b border-border/60 last:border-0 group">
      <CircleDot
        size={14}
        className="shrink-0 mt-0.5"
        style={{ color: STATUS_COLORS[task.status] }}
      />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-foreground truncate">{task.title}</p>
        {task.project && (
          <p className="text-xs text-muted-foreground truncate mt-0.5">{task.project.name}</p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {task.priority && (
          <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-md uppercase tracking-wide", PRIORITY_STYLES[task.priority])}>
            {task.priority}
          </span>
        )}
        {task.dueDate && (
          <span className={cn("flex items-center gap-1 text-xs", isOverdue ? "text-red-500" : "text-muted-foreground")}>
            {isOverdue ? <AlertCircle size={11} /> : <CalendarDays size={11} />}
            {format(new Date(task.dueDate), "MMM d")}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const { data: stats, isLoading } = useDashboard();

  const statusEntries = stats
    ? Object.entries(stats.tasksByStatus).map(([status, count]) => ({ status, count }))
    : [];
  const totalTasks = statusEntries.reduce((s, e) => s + (e.count as number), 0);

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
          <span className="text-[#208ca2]">{user?.name?.split(" ")[0]}</span>
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here's what's happening across your workspace today.
        </p>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard icon={FolderKanban} label="Total Projects" value={stats?.totalProjects ?? 0} color="#208ca2" />
          <StatCard icon={CheckSquare} label="Assigned Tasks" value={stats?.assignedTasks ?? 0} color="#57f6e7" />
          <StatCard icon={AlertCircle} label="Overdue" value={stats?.overdueTasks ?? 0} sub="Need attention" color="#f87171" />
          <StatCard icon={TrendingUp} label="Completed" value={stats?.completedTasks ?? 0} sub="All time" color="#22c55e" />
        </div>
      )}

      {/* Progress + tasks grid */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Status breakdown */}
        <div className="lg:col-span-2 rounded-2xl border border-border bg-card p-5">
          <h2 className="text-sm font-semibold text-foreground mb-4">Task Status Breakdown</h2>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-8 rounded-lg" />)}
            </div>
          ) : totalTasks === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {statusEntries.map(({ status, count }) => {
                const pct = totalTasks > 0 ? Math.round(((count as number) / totalTasks) * 100) : 0;
                const label = status.replace("_", " ");
                return (
                  <div key={status}>
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-muted-foreground font-medium">{label}</span>
                      <span className="text-foreground font-semibold tabular-nums">{count as number} <span className="text-muted-foreground font-normal">({pct}%)</span></span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${pct}%`, background: STATUS_COLORS[status] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Recent tasks */}
        <div className="lg:col-span-3 rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-semibold text-foreground">Recent Tasks</h2>
            <Link to="/projects" className="flex items-center gap-1 text-xs text-[#208ca2] hover:underline">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-12 rounded-lg" />)}
            </div>
          ) : !stats?.recentTasks?.length ? (
            <div className="flex flex-col items-center py-10 text-muted-foreground">
              <CheckSquare size={32} className="mb-2 opacity-30" />
              <p className="text-sm">No tasks yet. Start by creating a project.</p>
              <Link to="/projects" className="mt-3 text-xs text-[#208ca2] hover:underline">
                Go to Projects →
              </Link>
            </div>
          ) : (
            <div>
              {stats.recentTasks.map((task) => <TaskRow key={task.id} task={task} />)}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming tasks */}
      {!!stats?.upcomingTasks?.length && (
        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-[#208ca2]" />
            <h2 className="text-sm font-semibold text-foreground">Due in the Next 7 Days</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {stats.upcomingTasks.map((task) => <TaskRow key={task.id} task={task} />)}
          </div>
        </div>
      )}
    </div>
  );
}