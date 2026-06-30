import { cn } from "@/lib/cn";

const tones = {
  neutral: "bg-surface-muted text-muted-foreground ring-border",
  blue: "bg-sky-50 text-info ring-sky-200",
  green: "bg-emerald-50 text-success ring-emerald-200",
  amber: "bg-amber-50 text-warning ring-amber-200",
  red: "bg-red-50 text-destructive ring-red-200",
  teal: "bg-teal-50 text-primary ring-teal-200",
};

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: keyof typeof tones;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1",
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}
