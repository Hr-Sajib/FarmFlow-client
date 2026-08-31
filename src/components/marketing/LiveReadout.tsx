"use client";

import { useEffect, useState } from "react";
import { Droplets, Sun, Thermometer, Sprout } from "lucide-react";

/**
 * The signature element: a readout that keeps moving.
 *
 * A static screenshot cannot show that this product is live, which is the one
 * thing separating it from a general farm-management app. Values drift within
 * plausible greenhouse bounds so the hero demonstrates the idea before a
 * visitor has an account.
 */
const METRICS = [
  { key: "temp", label: "Temperature", unit: "°C", icon: Thermometer, base: 27.4, swing: 0.6 },
  { key: "hum", label: "Humidity", unit: "%", icon: Droplets, base: 68, swing: 2.5 },
  { key: "soil", label: "Soil moisture", unit: "%", icon: Sprout, base: 54, swing: 1.8 },
  { key: "light", label: "Light", unit: "klx", icon: Sun, base: 12.6, swing: 1.1 },
];

export function LiveReadout() {
  const [values, setValues] = useState(() => METRICS.map((m) => m.base));

  useEffect(() => {
    const id = setInterval(() => {
      setValues((prev) =>
        prev.map((v, i) => {
          const m = METRICS[i];
          const drift = (Math.random() - 0.5) * m.swing;
          // Pull gently back toward the baseline so values never wander off.
          const next = v + drift + (m.base - v) * 0.12;
          return next;
        })
      );
    }, 2200);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="rounded-card bg-surface/95 p-5 backdrop-blur card-shadow-lg">
      <div className="mb-4 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-shoot-deep" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-shoot-deep" />
        </span>
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Greenhouse 02 · live
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
        {METRICS.map((m, i) => {
          const Icon = m.icon;
          return (
            <div key={m.key}>
              <dt className="flex items-center gap-1.5 text-[0.6875rem] text-ink-faint">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {m.label}
              </dt>
              <dd className="tabular mt-1 text-2xl font-semibold text-ink transition-[color] duration-300">
                {values[i].toFixed(1)}
                <span className="ml-0.5 text-sm font-normal text-ink-faint">{m.unit}</span>
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
