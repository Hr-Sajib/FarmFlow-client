"use client";

import { useEffect, useState } from "react";
import { Droplets, Sun, Thermometer, Sprout } from "lucide-react";

import { API_BASE } from "@/lib/config";
import type { PublicReading } from "@/lib/types";

/**
 * The signature element: real readings from the platform, moving.
 *
 * A static screenshot cannot show that this product is live, which is the one
 * thing separating it from a general farm-management app. The server renders
 * the first value so the hero is never blank, then this polls the public
 * endpoint for updates.
 *
 * Polling rather than a socket: an anonymous visitor gets no handshake, no
 * room membership and no persistent connection to hold open. The endpoint is
 * read-only, rate limited and carries no farm identity.
 */
const METRICS = [
  { key: "temperature", label: "Temperature", unit: "°C", icon: Thermometer, decimals: 1 },
  { key: "humidity", label: "Humidity", unit: "%", icon: Droplets, decimals: 1 },
  { key: "soilMoisture", label: "Soil moisture", unit: "%", icon: Sprout, decimals: 1 },
  { key: "lightIntensity", label: "Light", unit: "lux", icon: Sun, decimals: 0 },
] as const;

// Matches the sensor cadence. The authenticated dashboard needs no equivalent:
// readings are pushed over the socket as they arrive, so it already moves at
// whatever rate the hardware publishes.
const POLL_MS = 2000;

export function LiveReadout({ initial }: { initial: PublicReading | null }) {
  const [reading, setReading] = useState(initial);

  useEffect(() => {
    let cancelled = false;

    const poll = async () => {
      try {
        const res = await fetch(`${API_BASE}/public/telemetry/latest`);
        if (!res.ok || cancelled) return;
        const body = (await res.json()) as { data: PublicReading | null };
        if (!cancelled && body.data) setReading(body.data);
      } catch {
        // A dropped poll is not worth surfacing — the previous reading stays
        // on screen and the next tick tries again.
      }
    };

    const id = setInterval(poll, POLL_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div className="rounded-card bg-surface/95 p-5 backdrop-blur card-shadow-lg">
      <div className="mb-4 flex items-center gap-2">
        <span className="relative flex h-2 w-2">
          <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-shoot-deep" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-shoot-deep" />
        </span>
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
          {reading ? `${reading.label} · live` : "Waiting for a reading"}
        </span>
      </div>

      <dl className="grid grid-cols-2 gap-x-6 gap-y-4">
        {METRICS.map((m) => {
          const Icon = m.icon;
          const value = reading?.[m.key];
          return (
            <div key={m.key}>
              <dt className="flex items-center gap-1.5 text-[0.6875rem] text-ink-faint">
                <Icon className="h-3.5 w-3.5" strokeWidth={1.75} />
                {m.label}
              </dt>
              <dd className="tabular mt-1 text-2xl font-semibold text-ink transition-[color] duration-300">
                {typeof value === "number" ? (
                  <>
                    {value.toFixed(m.decimals)}
                    <span className="ml-0.5 text-sm font-normal text-ink-faint">
                      {m.unit}
                    </span>
                  </>
                ) : (
                  <span className="text-ink-faint">—</span>
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
