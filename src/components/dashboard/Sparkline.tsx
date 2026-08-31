/**
 * Server-rendered sparkline. Drawn as a plain SVG path rather than through a
 * chart library so a grid of field cards costs no client JavaScript.
 */
export function Sparkline({
  values,
  className,
  strokeWidth = 1.75,
}: {
  values: number[];
  className?: string;
  strokeWidth?: number;
}) {
  if (values.length < 2) {
    return <div className={className} aria-hidden="true" />;
  }

  const width = 100;
  const height = 28;
  const min = Math.min(...values);
  const max = Math.max(...values);
  // A flat series would divide by zero; render it down the middle instead.
  const span = max - min || 1;

  const points = values.map((value, i) => {
    const x = (i / (values.length - 1)) * width;
    const y = height - ((value - min) / span) * (height - 4) - 2;
    return `${x.toFixed(2)},${y.toFixed(2)}`;
  });

  return (
    <svg
      className={className}
      viewBox={`0 0 ${width} ${height}`}
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <polyline
        points={points.join(" ")}
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}
