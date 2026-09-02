"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { MonthlyCount } from "@/lib/types";

/**
 * Cumulative accounts over twelve months, drawn on the translucent chart panel.
 *
 * The panel is 40% white over a dark section, so it resolves to a mid tone
 * rather than to white — the muted ink these labels used measures 1.2:1
 * against it and disappears. Full-strength ink is the only step that clears
 * 4.5:1, so the axis text is darker here than muted axis text usually is.
 *
 * Cumulative rather than per-month: the question a total answers is "how big is
 * this now", and a per-month bar of mostly zeros answers a different one. The
 * month's own signups stay available in the tooltip.
 */
export function GrowthChart({
  data,
  color,
  label,
}: {
  data: MonthlyCount[];
  color: string;
  label: string;
}) {
  const short = (month: string) => {
    const [y, m] = month.split("-");
    return `${["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Number(m) - 1]} ${y.slice(2)}`;
  };

  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: -22 }}>
          <defs>
            <linearGradient id={`growth-${label}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.45} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(0,0,0,0.14)" vertical={false} />
          <XAxis
            dataKey="month"
            tickFormatter={short}
            tick={{ fontSize: 10, fill: "var(--color-ink)" }}
            axisLine={false}
            tickLine={false}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fontSize: 10, fill: "var(--color-ink)" }}
            axisLine={false}
            tickLine={false}
            width={44}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-line)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--color-ink)",
            }}
            labelFormatter={(m) => short(String(m))}
            formatter={(value, _name, item) => [
              `${value} total · +${(item?.payload as MonthlyCount)?.count ?? 0} that month`,
              label,
            ]}
          />
          <Area
            type="monotone"
            dataKey="cumulative"
            stroke={color}
            strokeWidth={2}
            fill={`url(#growth-${label})`}
            dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
