import { cn } from "@/lib/cn";
import { Card } from "./Card";

export function StatCard({
  label,
  value,
  helper,
  tone = "neutral",
}: {
  label: string;
  value: string | number;
  helper?: string;
  tone?: "neutral" | "info" | "success" | "warning" | "danger";
}) {
  const toneClass = {
    neutral: "border-border",
    info: "border-sky-200 bg-sky-50/45",
    success: "border-emerald-200 bg-emerald-50/45",
    warning: "border-amber-200 bg-amber-50/55",
    danger: "border-red-200 bg-red-50/55",
  }[tone];

  return (
    <Card className={cn("min-h-28", toneClass)}>
      <p className="text-xs font-bold tracking-[0.16em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-3xl font-black tracking-tight text-foreground">{value}</p>
      {helper ? <p className="mt-1 text-sm leading-5 text-muted-foreground">{helper}</p> : null}
    </Card>
  );
}
