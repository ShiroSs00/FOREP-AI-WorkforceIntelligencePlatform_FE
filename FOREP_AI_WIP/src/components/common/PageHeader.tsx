import { cn } from "@/lib/cn";

export function PageHeader({
  eyebrow,
  title,
  description,
  action,
  primaryAction,
  secondaryAction,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  primaryAction?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}) {
  const actions = primaryAction ?? secondaryAction ?? action ? (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      {secondaryAction}
      {primaryAction ?? action}
    </div>
  ) : null;

  return (
    <header className={cn("mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs font-bold tracking-[0.24em] text-primary">{eyebrow}</p> : null}
        <h1 className="mt-2 text-2xl font-black tracking-tight text-foreground sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
      </div>
      {actions}
    </header>
  );
}
