"use client";

import { useEffect, useLayoutEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/**
 * Animates a section between its own content heights instead of jumping.
 *
 * A ResizeObserver on the content reports its natural height, which is written
 * onto the wrapper as an explicit pixel value so it has something to
 * transition between — `height: auto` is not an animatable value, and the
 * CSS that would fix that (interpolate-size) is not in every browser yet.
 *
 * The first measurement is applied without a transition. Otherwise every one
 * of these would animate open from zero on page load, which reads as the page
 * still arriving rather than as a section responding to something.
 */
export function AutoHeight({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const content = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState<number | null>(null);
  const [animate, setAnimate] = useState(false);

  // Two sources, because neither alone is enough. The observer catches changes
  // React knows nothing about — an image finishing, a font swapping, the window
  // reflowing. This one catches the common case of the children being replaced,
  // which the observer proved unreliable for: swapping a tall subtree for a
  // short one left the wrapper pinned at the old height.
  useLayoutEffect(() => {
    const el = content.current;
    if (el) setHeight(el.offsetHeight);
  });

  useLayoutEffect(() => {
    const el = content.current;
    if (!el) return;

    const observer = new ResizeObserver(() => setHeight(el.offsetHeight));
    observer.observe(el);

    return () => observer.disconnect();
  }, []);

  // Enabled a frame after the first measurement, so the initial height lands
  // instantly and only later changes are animated.
  useEffect(() => {
    if (height === null || animate) return;
    // A timer for the same reason as in Modal: an animation frame never
    // arrives in a tab that is not painting.
    const id = setTimeout(() => setAnimate(true), 10);
    return () => clearTimeout(id);
  }, [height, animate]);

  return (
    <div
      style={{ height: height ?? undefined }}
      className={cn(
        "overflow-hidden",
        animate &&
          "transition-[height] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        className
      )}
    >
      {/* flow-root, so the children's top and bottom margins are contained
          rather than collapsing through this element. Without it offsetHeight
          under-reports by the first child's margin and the last row of the
          section gets clipped. */}
      <div ref={content} className="flow-root">
        {children}
      </div>
    </div>
  );
}
