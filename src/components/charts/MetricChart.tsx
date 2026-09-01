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

import type { SeriesBucket } from "@/lib/types";
import { SERIES, type MetricKey } from "./seriesTheme";

/** 18000 -> "18k". Lux runs to five digits and would otherwise clip the axis. */
const fmtValue = (v: number) =>
  Math.abs(v) >= 1000 ? `${(v / 1000).toFixed(v % 1000 === 0 ? 0 : 1)}k` : String(v);

const fmtTime = (iso: string, range: string) => {
  const d = new Date(iso);
  return range === "1h" || range === "24h"
    ? d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : d.toLocaleDateString([], { day: "numeric", month: "short" });
};

/**
 * One metric, one axis. See seriesTheme for why these are small multiples
 * rather than four lines sharing a plot.
 */
export function MetricChart({
  metric,
  data,
  range,
}: {
  metric: MetricKey;
  data: SeriesBucket[];
  range: string;
}) {
  const spec = SERIES[metric];
  const points = data
    .filter((d) => d[metric] !== null)
    .map((d) => ({ ts: d.ts, value: d[metric] as number }));

  const current = points.at(-1)?.value ?? null;

  return (
    <div className="rounded-card bg-surface p-5 card-shadow">
      <div className="mb-4 flex items-baseline justify-between gap-3">
        <div>
          {/* The title names the series, so no legend is needed. */}
          <h3 className="text-sm font-medium text-ink-soft">{spec.label}</h3>
          <p className="tabular mt-0.5 text-2xl font-semibold text-ink">
            {current === null ? "—" : current.toFixed(spec.decimals)}
            <span className="ml-1 text-sm font-normal text-ink-faint">{spec.unit}</span>
          </p>
        </div>
        <span
          className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full"
          style={{ background: spec.color }}
          aria-hidden="true"
        />
      </div>

      {points.length < 2 ? (
        <div className="flex h-[140px] items-center justify-center rounded-tile bg-surface-sunk">
          <p className="text-xs text-ink-faint">
            Not enough readings yet for this window
          </p>
        </div>
      ) : (
        <div className="h-[140px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: -18 }}>
              <defs>
                <linearGradient id={`fill-${metric}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={spec.color} stopOpacity={0.18} />
                  <stop offset="100%" stopColor={spec.color} stopOpacity={0} />
                </linearGradient>
              </defs>

              {/* Grid and axes stay recessive — the data is the figure. */}
              <CartesianGrid stroke="var(--color-line-soft)" vertical={false} />
              <XAxis
                dataKey="ts"
                tickFormatter={(v) => fmtTime(v, range)}
                tick={{ fontSize: 10, fill: "var(--color-ink-faint)" }}
                axisLine={false}
                tickLine={false}
                minTickGap={40}
              />
              <YAxis
                tick={{ fontSize: 10, fill: "var(--color-ink-faint)" }}
                tickFormatter={fmtValue}
                axisLine={false}
                tickLine={false}
                width={40}
                domain={["auto", "auto"]}
              />
              <Tooltip
                cursor={{ stroke: "var(--color-ink-faint)", strokeWidth: 1 }}
                contentStyle={{
                  background: "var(--color-surface)",
                  border: "1px solid var(--color-line)",
                  borderRadius: "0.75rem",
                  fontSize: "0.75rem",
                  boxShadow: "0 8px 24px -12px rgba(18,33,26,.2)",
                }}
                labelFormatter={(v) => fmtTime(String(v), range)}
                formatter={(value) => [
                  `${Number(value).toFixed(spec.decimals)} ${spec.unit}`,
                  spec.label,
                ]}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke={spec.color}
                strokeWidth={2}
                fill={`url(#fill-${metric})`}
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: "var(--color-surface)" }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
