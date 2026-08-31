import { cn } from "@/lib/utils";

/**
 * The base surface. `tone="dark"` gives the bark-coloured variant used to break
 * up a grid of white cards, as in the reference dashboards.
 */
export function Card({
  tone = "light",
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { tone?: "light" | "dark" | "sunk" }) {
  return (
    <div
      className={cn(
        "rounded-card",
        tone === "light" && "bg-surface card-shadow",
        tone === "dark" && "bg-bark text-ink-invert",
        tone === "sunk" && "bg-surface-sunk",
        className
      )}
      {...props}
    />
  );
}

export function CardHeader({
  title,
  subtitle,
  action,
  className,
}: {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex items-start justify-between gap-4", className)}>
      <div className="min-w-0">
        <h3 className="font-display text-[0.95rem] font-semibold tracking-tight">{title}</h3>
        {subtitle ? (
          <p className="mt-0.5 text-xs text-ink-faint">{subtitle}</p>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
