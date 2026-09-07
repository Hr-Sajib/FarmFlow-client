"use client";

import { useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { Droplets, Sun, Thermometer, Sprout } from "lucide-react";

import { API_BASE } from "@/lib/config";
import type { Reading } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { ReadingTile } from "./ReadingTile";
import { SERIES } from "@/components/charts/seriesTheme";

type TelemetryUpdate = {
  fieldId: string;
  ts: string;
  temperature?: number;
  humidity?: number;
  soilMoisture?: number;
  lightIntensity?: number;
};

const FRESH_WINDOW_MS = 10 * 60 * 1000;

/**
 * The one field detail page's readings, kept current over the telemetry
 * socket rather than server-rendered once and left to go stale.
 *
 * The fields *list* throttles its socket-driven refresh to 15s, because that
 * refresh re-renders every card on the page — a cost worth avoiding at that
 * scale. Patching four numbers on the one field someone is actually looking
 * at has no such cost, so this updates on every message, matching whatever
 * cadence the sensor actually publishes at.
 */
export function LiveReadings({
  fieldId,
  farmerId,
  initial,
}: {
  fieldId: string;
  /**
   * A farmer's own socket already resolves to their own room; an admin's
   * does not, since an admin has no farm of their own — the server falls
   * back to `socket.farmerCode` only when this is absent, which would join
   * an admin to nothing. Passing the field's actual owner makes this work
   * for both.
   */
  farmerId: string;
  initial: Reading | null;
}) {
  const [latest, setLatest] = useState<Reading | null>(initial);

  useEffect(() => {
    let socket: Socket | null = null;
    let cancelled = false;

    const connect = async () => {
      const res = await fetch("/api/socket-token", { credentials: "include" });
      if (!res.ok || cancelled) return;
      const { token } = (await res.json()) as { token: string | null };
      if (!token || cancelled) return;

      socket = io(`${API_BASE}/telemetry`, { auth: { token } });

      socket.on("connect_error", (err: Error) => {
        console.warn("[telemetry] socket refused the handshake:", err.message);
      });

      socket.on("connect", () => socket?.emit("telemetry:watch", { farmerId }));

      socket.on("telemetry:update", (update: TelemetryUpdate) => {
        // The room is per-farm, not per-field, so a farm with several fields
        // shares one socket — filter to the one this page is showing.
        if (update.fieldId !== fieldId) return;
        setLatest((prev) => ({
          ts: update.ts,
          meta: prev?.meta ?? { farmerId: "", fieldId },
          temperature: update.temperature,
          humidity: update.humidity,
          soilMoisture: update.soilMoisture,
          lightIntensity: update.lightIntensity,
        }));
      });
    };

    void connect();

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [fieldId, farmerId]);

  const fresh =
    latest && Date.now() - new Date(latest.ts).getTime() < FRESH_WINDOW_MS;

  return (
    <div className="rounded-card bg-surface p-6 card-shadow">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-semibold tracking-tight">
          Live readings
        </h3>
        {fresh ? (
          <Badge tone="signal" className="gap-1.5">
            <span className="relative flex h-1.5 w-1.5">
              <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-ink/70" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ink/70" />
            </span>
            Live
          </Badge>
        ) : (
          <Badge tone="neutral">
            {latest ? <TimeAgo value={latest.ts} prefix="Updated " /> : "No readings yet"}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <ReadingTile
          icon={Thermometer}
          label="Temperature"
          value={latest?.temperature}
          unit="°C"
          color={SERIES.temperature.color}
          decimals={SERIES.temperature.decimals}
        />
        <ReadingTile
          icon={Droplets}
          label="Humidity"
          value={latest?.humidity}
          unit="%"
          color={SERIES.humidity.color}
          decimals={SERIES.humidity.decimals}
        />
        <ReadingTile
          icon={Sprout}
          label="Soil moisture"
          value={latest?.soilMoisture}
          unit="%"
          color={SERIES.soilMoisture.color}
          decimals={SERIES.soilMoisture.decimals}
        />
        <ReadingTile
          icon={Sun}
          label="Light"
          value={latest?.lightIntensity}
          unit="lux"
          color={SERIES.lightIntensity.color}
          decimals={SERIES.lightIntensity.decimals}
        />
      </div>
    </div>
  );
}
