import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

type Variant = "primary" | "signal" | "ghost" | "outline" | "dark";
type Size = "sm" | "md" | "lg";

const VARIANTS: Record<Variant, string> = {
  // Deep green: the default commitment action.
  primary: "bg-canopy text-ink-invert hover:bg-canopy-deep",
  // Lime is the signal colour — reserved for the single most important action
  // on a screen, never two at once.
  signal: "bg-shoot text-ink hover:bg-shoot-deep",
  ghost: "text-ink-soft hover:bg-surface-sunk hover:text-ink",
  outline: "border border-line bg-surface text-ink hover:border-canopy hover:text-canopy",
  dark: "bg-bark text-ink-invert hover:bg-bark-soft",
};

const SIZES: Record<Size, string> = {
  sm: "h-9 px-4 text-sm gap-1.5",
  md: "h-11 px-5 text-sm gap-2",
  lg: "h-13 px-7 text-base gap-2.5",
};

export function Button({
  variant = "primary",
  size = "md",
  asChild = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  asChild?: boolean;
}) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(
        "inline-flex items-center justify-center rounded-pill font-medium",
        "transition-[background-color,color,border-color,transform] duration-200",
        "active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
        VARIANTS[variant],
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}
