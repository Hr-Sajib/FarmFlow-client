import { cn } from "@/lib/utils";

type Tone = "neutral" | "canopy" | "signal" | "warn" | "alert" | "onDark";

const TONES: Record<Tone, string> = {
  neutral: "bg-surface-sunk text-ink-soft",
  canopy: "bg-canopy-tint text-canopy",
  signal: "bg-shoot text-ink",
  warn: "bg-warn-tint text-warn",
  alert: "bg-alert-tint text-alert",
  onDark: "bg-white/10 text-ink-invert",
};

export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & { tone?: Tone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-pill px-2.5 py-1",
        "text-[0.6875rem] font-medium leading-none",
        TONES[tone],
        className
      )}
      {...props}
    />
  );
}
