import Link from "next/link";
import { Droplets, Sun, Thermometer, Sprout, ArrowUpRight } from "lucide-react";

import type { Field, Reading, SeriesBucket } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { SafeImage } from "@/components/ui/SafeImage";
import { MetricTile } from "./MetricTile";
import { Sparkline } from "./Sparkline";
import { TimeAgo } from "@/components/ui/TimeAgo";

const ENV_LABEL: Record<Field["environmentType"], string> = {
  greenhouse: "Greenhouse",
  net_house: "Net house",
  open_field: "Open field",
};

/**
 * Server component: the card renders complete with its latest reading and
 * trend already in the HTML. The live socket updates it afterwards, so a
 * visitor never sees zeros waiting to be replaced.
 */
export function FieldCard({
  field,
  latest,
  series,
}: {
  field: Field;
  latest: Reading | null;
  series: SeriesBucket[];
}) {
  const trend = series
    .map((b) => b.soilMoisture)
    .filter((v): v is number => v !== null);

  const isLive =
    latest && Date.now() - new Date(latest.ts).getTime() < 10 * 60 * 1000;

  return (
    <Link
      href={`/fields/${field.fieldId}`}
      className="group block overflow-hidden rounded-card bg-surface card-shadow transition-transform duration-300 hover:-translate-y-1"
    >
      {/* photo header, as in the reference dashboards */}
      <div className="relative h-36 overflow-hidden bg-surface-sunk">
        {field.fieldImage ? (
          <SafeImage
            src={field.fieldImage}
            alt=""
            fill
            sizes="(max-width: 1024px) 100vw, 420px"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-bark/30 via-transparent to-transparent" />

        <div className="absolute right-3 top-3">
          {isLive ? (
            <Badge tone="signal" className="gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-ink/70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ink/70" />
              </span>
              Live
            </Badge>
          ) : (
            <Badge tone="onDark">
              {latest ? <TimeAgo value={latest.ts} /> : "No data yet"}
            </Badge>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* basic info lives below the photo, not over it — legible regardless
            of how bright or busy the field image is */}
        <div className="mb-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-display text-lg font-semibold text-ink">
              {field.fieldName}
            </p>
            <p className="truncate text-xs text-ink-faint">
              {ENV_LABEL[field.environmentType]} · {field.fieldCrop}
            </p>
            <p className="tabular truncate text-[0.6875rem] text-ink-faint/70">
              {field.fieldId}
            </p>
          </div>
          <ArrowUpRight className="h-5 w-5 shrink-0 text-ink-faint transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <MetricTile icon={Thermometer} label="Temp" value={latest?.temperature} unit="°C" />
          <MetricTile icon={Droplets} label="Humidity" value={latest?.humidity} unit="%" />
          <MetricTile icon={Sprout} label="Soil" value={latest?.soilMoisture} unit="%" />
          <MetricTile icon={Sun} label="Light" value={latest?.lightIntensity} unit="lx" />
        </div>

        {trend.length > 1 ? (
          <div className="mt-4">
            <div className="mb-1.5 flex items-baseline justify-between">
              <span className="text-[0.6875rem] text-ink-faint">
                Soil moisture · 24h
              </span>
            </div>
            <Sparkline values={trend} className="h-7 w-full text-canopy" />
          </div>
        ) : null}
      </div>
    </Link>
  );
}
