import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatNumber } from "@/lib/utils";

/**
 * The stat pill from the reference dashboards: icon, label, value, unit.
 *
 * `color` is optional and, when given, tints the icon in a small badge — the
 * same colour that metric gets in the trend charts, so a card's readings and
 * their own charts read as one system rather than a flat grey list.
 */
export function MetricTile({
  icon: Icon,
  label,
  value,
  unit,
  tone = "light",
  color,
  className,
}: {
  icon: LucideIcon;
  label: string;
  value: number | null | undefined;
  unit: string;
  tone?: "light" | "dark";
  color?: string;
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
        {color ? (
          <span
            className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
            style={{ background: `${color}1f`, color }}
          >
            <Icon className="h-3 w-3" strokeWidth={2.1} />
          </span>
        ) : (
          <Icon className="h-3.5 w-3.5" strokeWidth={1.85} />
        )}
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
