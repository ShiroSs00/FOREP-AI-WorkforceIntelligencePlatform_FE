import { cn } from "@/lib/cn";

export function LoadingState({
  label = "Đang tải dữ liệu...",
  rows = 3,
  className,
}: {
  label?: string;
  rows?: number;
  className?: string;
}) {
  return (
    <div className={cn("rounded-card border border-border bg-surface p-5", className)} aria-live="polite" aria-busy="true">
      <p className="text-sm font-semibold text-muted-foreground">{label}</p>
      <div className="mt-4 grid gap-3">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded-control bg-surface-muted" />
        ))}
      </div>
    </div>
  );
}
