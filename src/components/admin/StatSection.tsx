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
  imageClass = "object-cover",
  scrim,
  chartImage,
  className,
  chart,
  split = "half",
  aside,
  footer,
  children,
}: {
  title: string;
  image?: string;
  placement?: string;
  /**
   * How the section's image fills its box. `cover` crops it to the region;
   * `contain` shows the whole illustration, which suits artwork that reads as
   * an object rather than as a texture.
   */
  imageClass?: string;
  /** Gradient direction, matched to where the image sits. */
  scrim?: string;
  /** Puts the subject behind the chart instead of behind the whole section. */
  chartImage?: string;
  /** Column span — the row weights are set by the caller. */
  className?: string;
  /** Rendered in its own panel pinned to the right of the section. */
  chart?: React.ReactNode;
  /** Share of the width the figures keep: half, or a narrow 20% column. */
  split?: keyof typeof SPLIT;
  /**
   * Sits in its own column beside the title and figures. Unlike `chart` it
   * stops where that column stops, so a `footer` can run beneath it.
   */
  aside?: React.ReactNode;
  /** Spans the full width under both columns. */
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("relative overflow-hidden rounded-card bg-bark-soft", className)}>
      {image ? (
        <div className={cn("absolute", placement)}>
          <Image
            src={image}
            alt=""
            fill
            sizes="600px"
            className={imageClass}
          />
        </div>
      ) : null}

      {/* Two layers doing different jobs. The wash and blur push the whole
          image back so it reads as a background. The gradient then falls away
          from wherever the image sits, so the figures keep a constant contrast
          instead of one depending on whether the artwork behind it is light —
          these illustrations have pale backgrounds that white text vanishes
          into otherwise. */}
      {/* Only meaningful over a photograph; without one they would just darken
          this section relative to the others. */}
      {image ? (
        <>
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[6px]" />
          <div className={cn("absolute inset-0", scrim)} />
        </>
      ) : null}

      <div
        className={cn(
          "relative p-6 text-ink-invert lg:p-7",
          // Room for the pinned chart, plus clearance from it.
          chart && SPLIT[split].pad
        )}
      >
        <div className={cn(aside && "lg:grid lg:grid-cols-[38%_1fr] lg:gap-5")}>
          <div className="min-w-0">
            <h2 className="font-display text-lg font-semibold tracking-tight">
              {title}
            </h2>
            <div className="mt-5">{children}</div>
          </div>

          {/* The title lives in the left column, so this one starts at the top
              of the content box rather than below the heading. The negative
              margins are the section's own padding less the 12px gap the
              pinned charts use, which lands its top and right edges the same
              distance from the section border as those. */}
          {aside ? (
            <div className="mt-5 lg:-mr-4 lg:-mt-4">
              {aside}
            </div>
          ) : null}
        </div>

        {footer ? <div className="mt-5">{footer}</div> : null}
      </div>

      {/* Pinned rather than placed in the flow, so the gap to the section edge
          is the same slim 12px above, below and to the right — a chart that
          follows the figures instead inherits the section's much larger text
          padding on one side and whatever the content happens to leave on the
          others. Below lg there is no room to sit beside anything, so it
          returns to the flow underneath. */}
      {chart ? (
        <ChartSurface
          image={chartImage}
          radius={SPLIT[split].radius}
          className={cn(
            "mx-6 mb-6 h-40",
            "lg:absolute lg:inset-y-3 lg:mx-0 lg:mb-0 lg:h-auto",
            SPLIT[split].panel
          )}
        >
          {chart}
        </ChartSurface>
      ) : null}
    </section>
  );
}

/**
 * The chart's surface: image, wash, then the chart itself.
 *
 * The radius is repeated on each layer rather than left to overflow-hidden on
 * the wrapper. The backdrop-filter establishes its own layer, and a rounded
 * clip on an ancestor stops applying to siblings once that happens — so the
 * image would square off exactly the corners the panel had rounded.
 */
function ChartSurface({
  image,
  radius,
  className,
  children,
}: {
  image?: string;
  radius: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("relative overflow-hidden", radius, className)}>
      {image ? (
        <Image
          src={image}
          alt=""
          fill
          sizes="600px"
          className={cn("object-cover", radius)}
        />
      ) : null}
      {/* The wash sits over the image rather than being the panel's own colour,
          so the two stack in that order. The blur leaves the illustration as
          colour and shape: anything sharp enough to recognise is sharp enough
          to compete with the plotted line. */}
      <div
        className={cn(
          "absolute inset-0",
          radius,
          // Grey over an image, white where there is none. Over the dark
          // section a white wash already resolves to a grey, so the two panels
          // still read as the same surface — this only matches the one sitting
          // on a pale illustration to it. The literal colour is a step darker
          // than --color-line and a long way lighter than --color-ink-faint;
          // there is no token between the two.
          image ? "bg-[#c3cabf]/75 backdrop-blur-[14px]" : "bg-white/75"
        )}
      />
      <div className="absolute inset-3">{children}</div>
    </div>
  );
}

/**
 * A chart placed in the flow instead of pinned — for a section that needs
 * something spanning the full width beneath it.
 *
 * The height is what sizes it: the width is whatever its column leaves, and
 * the height would otherwise be dictated by the figures beside it. 14rem is
 * above that, so the chart drives the row rather than being cut to fit it.
 */
export function ChartPanel({
  image,
  children,
}: {
  image?: string;
  children: React.ReactNode;
}) {
  return (
    <ChartSurface
      image={image}
      radius="rounded-tile"
      className="min-h-[14rem] min-w-0 flex-1"
    >
      {children}
    </ChartSurface>
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
      <dd className="tabular mt-1 font-display text-4xl font-semibold">
        {value.toLocaleString()}
      </dd>
      {hint ? (
        <p className="mt-0.5 text-[0.6875rem] text-ink-invert/50">{hint}</p>
      ) : null}
    </div>
  );
}
