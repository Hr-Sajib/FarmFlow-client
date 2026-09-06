import {
  CloudRain,
  Droplets,
  MapPin,
  Sprout,
  Sun,
  Thermometer,
} from "lucide-react";

import type { FieldSnapshot } from "@/lib/types";
import { cn } from "@/lib/utils";

const ENV_LABEL: Record<string, string> = {
  greenhouse: "Greenhouse",
  net_house: "Net house",
  open_field: "Open field",
};

const Reading = ({
  icon: Icon,
  label,
  value,
  unit,
  decimals = 1,
}: {
  icon: typeof Thermometer;
  label: string;
  value?: number | null;
  unit: string;
  decimals?: number;
}) => (
  <div className="rounded-tile bg-surface-sunk px-3 py-2">
    <p className="flex items-center gap-1.5 text-[0.625rem] text-ink-faint">
      <Icon className="h-3 w-3" strokeWidth={1.9} />
      {label}
    </p>
    <p className="tabular mt-0.5 text-sm font-semibold text-ink">
      {typeof value === "number" ? (
        <>
          {value.toFixed(decimals)}
          <span className="ml-0.5 text-[0.625rem] font-normal text-ink-faint">
            {unit}
          </span>
        </>
      ) : (
        <span className="text-ink-faint">—</span>
      )}
    </p>
  </div>
);

/**
 * One field, as it was at the moment it was attached.
 *
 * The same card in an advisory thread and in a forum post, because the point
 * of attaching a field is that the person reading it does not have to ask the
 * follow-up questions — and those are the same questions wherever they are
 * reading. The values are the stored capture, never a fresh lookup: a thread
 * read months later should show what was true when the question was asked.
 */
export function FieldSnapshotCard({
  snapshot,
  className,
}: {
  snapshot: FieldSnapshot;
  className?: string;
}) {
  const { field, reading, soil, weather } = snapshot;
  /**
   * Formatted with an explicit locale and time zone on purpose.
   *
   * toLocaleString with neither resolves against the runtime, and Node's
   * defaults are not the browser's — the server rendered "6 Sept, 00:33" where
   * the client rendered "Sep 6, 12:33 AM", which is a hydration mismatch and
   * throws the whole subtree away to re-render. Pinning both makes the two
   * agree. The zone is the field's own, since the reading was taken there, not
   * wherever it is being read.
   */
  const zone = weather?.timezone;
  const captured = new Date(snapshot.capturedAt).toLocaleString("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: zone ?? "UTC",
  });

  // SoilGrids has real gaps in coverage; a missing profile is a fact about the
  // location, not a failure, so it is said rather than shown as zeros.
  const soilValues = soil
    ? Object.entries(soil).filter(([, v]) => typeof v === "number")
    : [];

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-card border border-line bg-surface",
        className
      )}
    >
      <header className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 border-b border-line-soft bg-canopy-tint/40 px-4 py-3">
        <div className="min-w-0">
          <p className="flex items-center gap-1.5 text-[0.625rem] font-medium uppercase tracking-[0.14em] text-canopy">
            <Sprout className="h-3 w-3" strokeWidth={2} />
            Field snapshot
          </p>
          <p className="mt-0.5 truncate font-display text-sm font-semibold">
            {field.fieldName}
          </p>
        </div>
        <p className="text-[0.625rem] text-ink-faint">
          {captured}
          {/* Said out loud when it is not the field's own clock, so the time is
              never quietly wrong by six hours. */}
          {zone ? null : " UTC"}
        </p>
      </header>

      <div className="space-y-3 px-4 py-3">
        <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-soft">
          <span className="capitalize">{field.fieldCrop}</span>
          <span>· {ENV_LABEL[field.environmentType] ?? field.environmentType}</span>
          {field.fieldSizeInAcres ? <span>· {field.fieldSizeInAcres} acres</span> : null}
          {field.soilType ? <span className="capitalize">· {field.soilType} soil</span> : null}
          <span className="inline-flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {field.location.latitude.toFixed(3)}, {field.location.longitude.toFixed(3)}
          </span>
        </p>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Reading icon={Thermometer} label="Temp" value={reading?.temperature} unit="°C" />
          <Reading icon={Droplets} label="Humidity" value={reading?.humidity} unit="%" />
          <Reading icon={Sprout} label="Soil" value={reading?.soilMoisture} unit="%" />
          <Reading icon={Sun} label="Light" value={reading?.lightIntensity} unit="lx" decimals={0} />
        </div>

        {soilValues.length ? (
          <div>
            <p className="text-[0.625rem] font-medium uppercase tracking-[0.12em] text-ink-faint">
              Soil profile
            </p>
            <dl className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
              {soilValues.map(([key, value]) => (
                <div key={key} className="flex items-baseline gap-1">
                  <dt className="text-[0.625rem] capitalize text-ink-faint">
                    {key.replace(/([A-Z])/g, " $1")}
                  </dt>
                  <dd className="tabular text-xs font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ) : (
          <p className="text-[0.625rem] text-ink-faint">
            No soil survey coverage at these coordinates.
          </p>
        )}

        {weather ? (
          <div className="rounded-tile bg-bark px-3 py-2.5 text-ink-invert">
            <div className="flex items-baseline justify-between gap-2">
              <p className="flex items-center gap-1.5 text-xs">
                <CloudRain className="h-3.5 w-3.5" strokeWidth={1.9} />
                {weather.current.description}
              </p>
              <p className="tabular text-sm font-semibold">
                {Math.round(weather.current.temperature)}
                {weather.units.temperature}
              </p>
            </div>
            <ul className="mt-2 grid grid-cols-3 gap-2">
              {weather.daily.map((day) => (
                <li key={day.date} className="rounded-tile bg-white/10 px-2 py-1.5 text-center">
                  <p className="text-[0.625rem] text-ink-invert/65">
                    {new Date(day.date).toLocaleDateString("en-GB", {
                      weekday: "short",
                      timeZone: zone ?? "UTC",
                    })}
                  </p>
                  <p className="tabular text-xs font-semibold">
                    {Math.round(day.temperatureMax)}° / {Math.round(day.temperatureMin)}°
                  </p>
                  <p className="tabular text-[0.625rem] text-ink-invert/55">
                    {day.precipitationProbabilityMax}% rain
                  </p>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </figure>
  );
}
