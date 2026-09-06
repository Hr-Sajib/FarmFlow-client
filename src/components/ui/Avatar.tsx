import { cn } from "@/lib/utils";
import { SafeImage } from "./SafeImage";

/**
 * One avatar for the whole app, so a photo uploaded on the profile shows up
 * everywhere the person appears rather than only where someone remembered to
 * check for it. Initials are the fallback, never a broken image.
 */
export function Avatar({
  name,
  photo,
  size = 36,
  className,
}: {
  name: string;
  photo?: string | null;
  size?: number;
  className?: string;
}) {
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "relative flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-canopy-tint font-semibold text-canopy",
        className
      )}
    >
      {photo ? (
        <SafeImage
          src={photo}
          alt=""
          fill
          sizes={`${size}px`}
          className="object-cover"
        />
      ) : (
        <span style={{ fontSize: Math.max(10, size * 0.34) }}>{initials}</span>
      )}
    </span>
  );
}
