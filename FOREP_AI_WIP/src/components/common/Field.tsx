import type { InputHTMLAttributes, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type CommonProps = {
  label: string;
  error?: string;
  helper?: string;
  optional?: boolean;
};

const controlClass =
  "focus-ring min-h-11 w-full rounded-control border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground shadow-sm placeholder:text-muted-foreground/70 disabled:bg-surface-muted";

function FieldShell({
  label,
  error,
  helper,
  children,
}: CommonProps & { children: React.ReactNode }) {
  return (
    <label className="grid gap-2 text-sm font-semibold text-foreground">
      <span>{label}</span>
      {children}
      {helper && !error ? <span className="text-xs font-medium text-muted-foreground">{helper}</span> : null}
      {error ? <span className="text-xs font-semibold text-destructive">{error}</span> : null}
    </label>
  );
}

export function Field({ label, error, helper, optional, className, ...props }: CommonProps & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <FieldShell label={label} error={error} helper={helper} optional={optional}>
      <input className={cn(controlClass, className)} {...props} />
    </FieldShell>
  );
}

export function TextArea({ label, error, helper, optional, className, ...props }: CommonProps & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <FieldShell label={label} error={error} helper={helper} optional={optional}>
      <textarea className={cn(controlClass, "min-h-32 resize-y leading-6", className)} {...props} />
    </FieldShell>
  );
}

export function Select({ label, error, helper, optional, children, className, ...props }: CommonProps & SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <FieldShell label={label} error={error} helper={helper} optional={optional}>
      <select className={cn(controlClass, className)} {...props}>
        {children}
      </select>
    </FieldShell>
  );
}
