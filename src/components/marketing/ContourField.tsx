/**
 * Topographic contour motif, echoing the field contour overlays in the
 * reference dashboards. Drawn rather than loaded so the hero has no image
 * dependency and no layout shift.
 */
export function ContourField({ className }: { className?: string }) {
  const rings = Array.from({ length: 9 }, (_, i) => i);

  return (
    <svg
      className={className}
      viewBox="0 0 800 500"
      fill="none"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <g stroke="currentColor" strokeWidth="1" opacity="0.5">
        {rings.map((i) => (
          <ellipse
            key={`a-${i}`}
            cx="235"
            cy="205"
            rx={38 + i * 27}
            ry={26 + i * 19}
            transform={`rotate(-14 235 205)`}
          />
        ))}
      </g>
      <g stroke="currentColor" strokeWidth="1" opacity="0.32">
        {rings.slice(0, 7).map((i) => (
          <ellipse
            key={`b-${i}`}
            cx="612"
            cy="366"
            rx={30 + i * 31}
            ry={21 + i * 22}
            transform={`rotate(9 612 366)`}
          />
        ))}
      </g>
      <g stroke="currentColor" strokeWidth="1" opacity="0.22">
        {rings.slice(0, 5).map((i) => (
          <ellipse key={`c-${i}`} cx="700" cy="86" rx={22 + i * 26} ry={16 + i * 17} />
        ))}
      </g>
    </svg>
  );
}
