"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

/** Must outlast the CSS below so the panel is gone only once it has faded. */
const EXIT_MS = 200;

/**
 * Dialog shell: backdrop, entrance, dismissal and focus, in one place.
 *
 * The panel settles from slightly oversized down to its real size rather than
 * appearing at full scale, so it reads as arriving rather than as a repaint.
 * Closing reverses it, which is why the element stays mounted for a moment
 * after `open` goes false — unmounting immediately would cut the exit off.
 *
 * Reduced-motion is handled globally in globals.css, which collapses these
 * durations; nothing here needs to branch on it.
 */
export function Modal({
  open,
  onClose,
  label,
  children,
  className,
}: {
  open: boolean;
  onClose: () => void;
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = useState(open);
  const [shown, setShown] = useState(false);
  const panel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setMounted(true);
      // A tick between mounting and showing is what gives the transition a
      // start value to move away from. A timer rather than an animation frame:
      // rAF does not fire while the tab is not painting, which would leave the
      // dialog mounted at opacity 0 — open, focusable, and invisible — until
      // the tab was brought forward.
      const id = setTimeout(() => setShown(true), 10);
      return () => clearTimeout(id);
    }
    setShown(false);
    const id = setTimeout(() => setMounted(false), EXIT_MS);
    return () => clearTimeout(id);
  }, [open]);

  useEffect(() => {
    if (!mounted) return;

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);

    // The page behind must not scroll while a dialog is over it.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [mounted, onClose]);

  useEffect(() => {
    if (shown) panel.current?.querySelector("input")?.focus();
  }, [shown]);

  if (!mounted) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={label}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className={cn(
        "fixed inset-0 z-50 flex items-end justify-center bg-bark/40 backdrop-blur-sm sm:items-center sm:p-6",
        "transition-opacity duration-200 ease-out",
        shown ? "opacity-100" : "opacity-0"
      )}
    >
      <div
        ref={panel}
        className={cn(
          "max-h-[90dvh] w-full overflow-y-auto rounded-t-card bg-surface p-6 card-shadow-lg sm:rounded-card",
          "transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)]",
          shown ? "scale-100 opacity-100" : "scale-[1.04] opacity-0",
          className
        )}
      >
        {children}
      </div>
    </div>
  );
}
