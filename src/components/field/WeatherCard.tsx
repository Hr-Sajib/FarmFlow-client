import { CloudRain, Droplets, Wind } from "lucide-react";
import type { Weather } from "@/lib/types";
import { Card } from "@/components/ui/Card";

/** Server-rendered — weather is fetched with the page, not after it. */
export function WeatherCard({ weather }: { weather: Weather }) {
  const today = weather.daily[0];

  return (
    <Card tone="dark" className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[0.6875rem] uppercase tracking-[0.14em] text-ink-invert/50">
            Outside
          </p>
          <p className="tabular mt-2 text-4xl font-semibold text-ink-invert">
            {weather.current.temperature.toFixed(0)}
            <span className="text-lg font-normal text-ink-invert/50">
              {weather.units.temperature}
            </span>
          </p>
          <p className="mt-1 text-sm text-ink-invert/70">
            {weather.current.description}
          </p>
        </div>

        {today ? (
          <div className="text-right text-xs text-ink-invert/60">
            <p className="tabular">
              H {today.temperatureMax.toFixed(0)}° · L {today.temperatureMin.toFixed(0)}°
            </p>
            <p className="mt-1 text-ink-invert/45">{weather.timezone}</p>
          </div>
        ) : null}
      </div>

      <dl className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-4">
        <div>
          <dt className="flex items-center gap-1 text-[0.6875rem] text-ink-invert/50">
            <Droplets className="h-3 w-3" /> Humidity
          </dt>
          <dd className="tabular mt-0.5 text-sm text-ink-invert">
            {weather.current.humidity.toFixed(0)}%
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-[0.6875rem] text-ink-invert/50">
            <Wind className="h-3 w-3" /> Wind
          </dt>
          <dd className="tabular mt-0.5 text-sm text-ink-invert">
            {weather.current.windSpeed.toFixed(0)} {weather.units.windSpeed}
          </dd>
        </div>
        <div>
          <dt className="flex items-center gap-1 text-[0.6875rem] text-ink-invert/50">
            <CloudRain className="h-3 w-3" /> Rain
          </dt>
          <dd className="tabular mt-0.5 text-sm text-ink-invert">
            {today ? `${today.precipitationProbabilityMax}%` : "—"}
          </dd>
        </div>
      </dl>

      {/* Next few days, compact — the decision it supports is "irrigate now or wait". */}
      <div className="mt-4 grid grid-cols-5 gap-1.5">
        {weather.daily.slice(1, 6).map((day) => (
          <div key={day.date} className="rounded-tile bg-white/5 px-1.5 py-2 text-center">
            <p className="text-[0.625rem] text-ink-invert/50">
              {new Date(day.date).toLocaleDateString([], { weekday: "short" })}
            </p>
            <p className="tabular mt-1 text-xs text-ink-invert">
              {day.temperatureMax.toFixed(0)}°
            </p>
            <p className="tabular text-[0.625rem] text-ink-invert/45">
              {day.precipitationProbabilityMax}%
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
