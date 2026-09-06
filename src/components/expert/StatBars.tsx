/**
 * A row of bars sharing one scale.
 *
 * Sharing the scale is the whole point: drawn to their own maxima, one
 * resolved conversation and one rejected credential would look identical, and
 * the comparison the chart exists to make would be lost.
 */
export function StatBars({
  bars,
  max,
}: {
  bars: Array<{ label: string; value: number; color: string }>;
  max: number;
}) {
  const scale = Math.max(max, 1);

  return (
    <ul className="space-y-2.5">
      {bars.map((bar) => (
        <li key={bar.label}>
          <div className="mb-1 flex items-baseline justify-between gap-3">
            <span className="text-xs text-ink-soft">{bar.label}</span>
            <span className="tabular text-xs font-semibold">{bar.value}</span>
          </div>
          <div className="h-2 overflow-hidden rounded-pill bg-surface-sunk">
            <div
              className="h-full rounded-pill transition-[width] duration-500 ease-out"
              style={{
                width: `${Math.min((bar.value / scale) * 100, 100)}%`,
                background: bar.color,
              }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
