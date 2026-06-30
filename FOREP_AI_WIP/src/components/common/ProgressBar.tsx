export function ProgressBar({ value = 0, showLabel = false }: { value?: number; showLabel?: boolean }) {
  const safe = Math.max(0, Math.min(100, Number.isFinite(value) ? value : 0));
  return (
    <div className="grid gap-1.5">
      {showLabel ? <div className="flex justify-between text-xs font-semibold text-muted-foreground"><span>Tiến độ</span><span>{safe}%</span></div> : null}
      <div className="h-2.5 rounded-full bg-surface-muted" aria-label={`Tiến độ ${safe}%`}>
        <div className="h-2.5 rounded-full bg-primary transition-[width]" style={{ width: `${safe}%` }} />
      </div>
    </div>
  );
}
