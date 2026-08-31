import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

/** The stat pill from the reference dashboards: icon, label, value, unit. */
export function MetricTile({
  icon: Icon,
  label,
  value,
  unit,
  tone = "light",
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: number | null | undefined;
  unit: string;
  tone?: "light" | "dark";
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-tile px-3.5 py-3",
        tone === "light" ? "bg-surface-sunk" : "bg-white/8",
        className
      )}
    >
      <p
        className={cn(
          "flex items-center gap-1.5 text-[0.6875rem]",
          tone === "light" ? "text-ink-faint" : "text-ink-invert/55"
        )}
      >
        <Icon className="h-3.5 w-3.5" strokeWidth={1.85} />
        {label}
      </p>
      <p
        className={cn(
          "tabular mt-1 text-lg font-semibold",
          tone === "light" ? "text-ink" : "text-ink-invert"
        )}
      >
        {formatNumber(value)}
        <span
          className={cn(
            "ml-0.5 text-xs font-normal",
            tone === "light" ? "text-ink-faint" : "text-ink-invert/50"
          )}
        >
          {unit}
        </span>
      </p>
    </div>
  );
}
