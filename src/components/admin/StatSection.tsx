import Image from "next/image";

import { cn } from "@/lib/utils";

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
  description,
  image,
  placement,
  scrim,
  className,
  chart,
  children,
}: {
  title: string;
  description: string;
  image: string;
  placement: string;
  /** Gradient direction, matched to where the image sits. */
  scrim: string;
  /** Column span — the row weights are set by the caller. */
  className?: string;
  /** Rendered in its own panel pinned to the right of the section. */
  chart?: React.ReactNode;
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
          // Room for the pinned chart, plus 12px of clearance from it.
          chart && "lg:pr-[calc(48%+1.5rem)]"
        )}
      >
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-sm text-ink-invert/65">{description}</p>
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
            "relative mx-6 mb-6 h-40 rounded-xl bg-surface",
            "lg:absolute lg:inset-y-3 lg:right-3 lg:mx-0 lg:mb-0 lg:h-auto lg:w-[48%]"
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
