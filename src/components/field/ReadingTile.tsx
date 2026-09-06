import type { LucideIcon } from "lucide-react";

import { formatNumber } from "@/lib/utils";

/**
 * One metric on the field detail page: a colour-coded icon and the current
 * value — the same colour a metric gets in the trend charts below, so a
 * reading and its own chart read as one thing.
 */
export function ReadingTile({
  icon: Icon,
  label,
  value,
  unit,
  color,
  decimals = 1,
}: {
  icon: LucideIcon;
  label: string;
  value: number | null | undefined;
  unit: string;
  color: string;
  decimals?: number;
}) {
  return (
    <div className="rounded-tile border border-line-soft bg-surface-sunk/60 p-4">
      <div className="flex items-center gap-2">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-tile"
          style={{ background: `${color}1a`, color }}
        >
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <p className="truncate text-xs font-medium text-ink-soft">{label}</p>
      </div>

      <p className="tabular mt-3 text-2xl font-semibold tracking-tight text-ink">
        {formatNumber(value, decimals)}
        <span className="ml-1 text-xs font-normal text-ink-faint">{unit}</span>
      </p>
    </div>
  );
}
