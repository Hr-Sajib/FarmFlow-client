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

      <div className="relative p-6 text-ink-invert lg:p-7">
        <h2 className="font-display text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-sm text-ink-invert/65">{description}</p>
        <div className="mt-5">{children}</div>
      </div>
    </section>
  );
}

/**
 * The chart's own surface inside a section.
 *
 * Charts sit on white rather than on the photograph: a line has to be read
 * precisely, and reading it against a blurred image that changes tone across
 * its own width is guesswork. It sits in the normal flow, so the section's
 * padding is what holds it off the edges.
 */
export function ChartPanel({ children }: { children: React.ReactNode }) {
  // Recharts' ResponsiveContainer measures its parent, and a chain of
  // percentage heights gives it nothing to measure — so the panel carries a
  // definite height and the chart fills it absolutely.
  return (
    <div className="relative min-h-[10.5rem] min-w-0 flex-1 rounded-xl bg-surface">
      <div className="absolute inset-3">{children}</div>
    </div>
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
