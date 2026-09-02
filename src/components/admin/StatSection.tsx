import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * How the width is split between the figures and the chart.
 *
 * Expressed as the chart's left edge rather than its width, so the number in
 * the class is literally the share the text gets — and both values are literal
 * strings, because Tailwind scans source text and never sees a class assembled
 * at runtime.
 */
const SPLIT = {
  half: {
    panel: "lg:left-[52%] lg:right-3",
    pad: "lg:pr-[calc(48%+1.5rem)]",
    radius: "rounded-xl",
  },
  wide: {
    panel: "lg:left-[20%] lg:right-3",
    pad: "lg:pr-[calc(80%+0.75rem)]",
    // A far larger surface than the half split, so it carries the softer
    // corner. Still under the section's own 24px, which keeps the inner
    // corner tighter than the one enclosing it.
    radius: "rounded-tile",
  },
} as const;

/**
 * A section panel with its subject photographed behind the numbers.
 *
 * The image is deliberately not a full-bleed background: it occupies one region
 * of the panel, placed differently per section so the five do not read as one
 * repeated template. A blur and a dark wash sit over the whole panel rather
 * than only over the image, which is what keeps the text legible at a constant
 * contrast wherever the photograph happens to be light or dark.
 */
export function StatSection({
  title,
  image,
  placement,
  scrim,
  className,
  chart,
  split = "half",
  children,
}: {
  title: string;
  image: string;
  placement: string;
  /** Gradient direction, matched to where the image sits. */
  scrim: string;
  /** Column span — the row weights are set by the caller. */
  className?: string;
  /** Rendered in its own panel pinned to the right of the section. */
  chart?: React.ReactNode;
  /** Share of the width the figures keep: half, or a narrow 20% column. */
  split?: keyof typeof SPLIT;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("relative overflow-hidden rounded-card bg-bark-soft", className)}>
      <div className={cn("absolute", placement)}>
        <Image src={image} alt="" fill sizes="600px" className="object-cover" />
      </div>

      {/* Two layers doing different jobs. The wash and blur push the whole
          image back so it reads as a background. The gradient then falls away
          from wherever the image sits, so the figures keep a constant contrast
          instead of one depending on whether the artwork behind it is light —
          these illustrations have pale backgrounds that white text vanishes
          into otherwise. */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[6px]" />
      <div className={cn("absolute inset-0", scrim)} />

      <div
        className={cn(
          "relative p-6 text-ink-invert lg:p-7",
          // Room for the pinned chart, plus clearance from it.
          chart && SPLIT[split].pad
        )}
      >
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <div className="mt-5">{children}</div>
      </div>

      {/* Pinned rather than placed in the flow, so the gap to the section edge
          is the same slim 12px above, below and to the right — a chart that
          follows the figures instead inherits the section's much larger text
          padding on one side and whatever the content happens to leave on the
          others. Below lg there is no room to sit beside anything, so it
          returns to the flow underneath. */}
      {chart ? (
        <div
          className={cn(
            "relative mx-6 mb-6 h-40 bg-white/40",
            SPLIT[split].radius,
            "lg:absolute lg:inset-y-3 lg:mx-0 lg:mb-0 lg:h-auto",
            SPLIT[split].panel
          )}
        >
          <div className="absolute inset-3">{chart}</div>
        </div>
      ) : null}
    </section>
  );
}

/** One figure. Kept text-only: a number needs a label, not a card. */
export function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint?: string;
}) {
  return (
    <div>
      <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink-invert/60">
        {label}
      </dt>
      <dd className="tabular mt-1 font-display text-2xl font-semibold">
        {value.toLocaleString()}
      </dd>
      {hint ? (
        <p className="mt-0.5 text-[0.6875rem] text-ink-invert/50">{hint}</p>
      ) : null}
    </div>
  );
}
