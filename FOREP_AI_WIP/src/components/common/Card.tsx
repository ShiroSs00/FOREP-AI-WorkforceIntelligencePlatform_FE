import { cn } from "@/lib/cn";

export function Card({
  children,
  className,
  as = "section",
}: {
  children: React.ReactNode;
  className?: string;
  as?: "section" | "div" | "article";
}) {
  const Component = as;
  return (
    <Component
      className={cn(
        "rounded-card border border-border bg-surface p-5 shadow-[0_1px_2px_rgba(16,24,39,0.05)]",
        className,
      )}
    >
      {children}
    </Component>
  );
}
