import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function CardSkeleton({ className }: { className?: string }) {
  return <Skeleton className={cn("h-36 rounded-2xl", className)} />;
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="rounded-2xl border border-border overflow-hidden">
      <div className="bg-muted/40 px-4 py-3">
        <Skeleton className="h-4 w-48 rounded-md" />
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-t border-border/60">
          <Skeleton className="h-4 w-4 rounded-full" />
          <Skeleton className="h-4 flex-1 rounded-md" />
          <Skeleton className="h-4 w-20 rounded-md" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-56 rounded-xl" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} className="h-28" />)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <CardSkeleton className="lg:col-span-2 h-56" />
        <CardSkeleton className="lg:col-span-3 h-56" />
      </div>
    </div>
  );
}