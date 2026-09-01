"use client";

import { useEffect, useState, useTransition } from "react";
import { cn } from "@/lib/utils";
import type { SeriesBucket } from "@/lib/types";
import { API_BASE } from "@/lib/config";
import { MetricChart } from "./MetricChart";
import { METRIC_ORDER } from "./seriesTheme";

const RANGES = [
  { value: "24h", label: "24 hours" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
] as const;

/**
 * The range control sits in one row above the charts and switches all four at
 * once — comparing metrics only means something over the same window.
 */
export function FieldTrends({
  fieldId,
  initial,
}: {
  fieldId: string;
  initial: SeriesBucket[];
}) {
  const [range, setRange] = useState<string>("24h");
  const [data, setData] = useState<SeriesBucket[]>(initial);
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    if (range === "24h") {
      setData(initial);
      return;
    }
    let cancelled = false;

    startTransition(() => {
      void (async () => {
        const res = await fetch(
          `${API_BASE}/sensorData/field/${fieldId}/series?range=${range}`,
          { credentials: "include" }
        );
        if (!res.ok || cancelled) return;
        const body = await res.json();
        if (!cancelled) setData(body.data ?? []);
      })();
    });

    return () => {
      cancelled = true;
    };
  }, [range, fieldId, initial]);

  return (
    <section>
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Trends
        </h2>
        <div
          role="group"
          aria-label="Time range"
          className="flex rounded-pill bg-surface-sunk p-1"
        >
          {RANGES.map((r) => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              aria-pressed={range === r.value}
              className={cn(
                "rounded-pill px-3.5 py-1.5 text-xs font-medium transition-colors duration-200",
                range === r.value
                  ? "bg-surface text-ink card-shadow"
                  : "text-ink-soft hover:text-ink"
              )}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div
        className={cn(
          "grid gap-4 transition-opacity duration-200 sm:grid-cols-2",
          pending && "opacity-60"
        )}
      >
        {METRIC_ORDER.map((metric) => (
          <MetricChart key={metric} metric={metric} data={data} range={range} />
        ))}
      </div>
    </section>
  );
}
