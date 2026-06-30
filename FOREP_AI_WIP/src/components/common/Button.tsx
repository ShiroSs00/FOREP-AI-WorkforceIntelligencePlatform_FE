import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";

const variants: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground shadow-sm hover:bg-teal-800",
  secondary: "border border-border bg-surface text-foreground shadow-sm hover:bg-surface-muted",
  outline: "border border-border bg-transparent text-foreground hover:bg-surface-muted",
  ghost: "bg-transparent text-muted-foreground hover:bg-surface-muted hover:text-foreground",
  danger: "bg-destructive text-white shadow-sm hover:bg-red-700",
};

export function Button({
  className,
  variant = "primary",
  type = "button",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  return (
    <button
      type={type}
      className={cn(
        "focus-ring inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-semibold transition-colors disabled:pointer-events-none",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
