import Image from "next/image";

import { cn } from "@/lib/utils";

const ALLOWED_HOST =
  process.env.NEXT_PUBLIC_S3_HOST ?? "farmflow-bucket.s3.ap-south-1.amazonaws.com";

const isOptimizable = (src: string): boolean => {
  if (src.startsWith("/")) return true; // a local public asset
  try {
    return new URL(src).hostname === ALLOWED_HOST;
  } catch {
    return false;
  }
};

/**
 * next/image throws at render time — not a catchable load error — for any
 * remote src whose host isn't in next.config's image allowlist. User-typed
 * and seeded content is not guaranteed to be, and a legacy or foreign URL
 * would otherwise take the whole page down instead of just its own image.
 *
 * Anything outside the allowlist falls back to a plain <img>, which carries
 * no such restriction — the image is simply served unoptimized.
 */
export function SafeImage({
  src,
  alt,
  className,
  fill,
  width,
  height,
  sizes,
  priority,
}: {
  src: string;
  alt: string;
  className?: string;
  fill?: boolean;
  width?: number;
  height?: number;
  sizes?: string;
  priority?: boolean;
}) {
  if (!isOptimizable(src)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt}
        width={fill ? undefined : width}
        height={fill ? undefined : height}
        className={cn(fill && "absolute inset-0 h-full w-full", className)}
      />
    );
  }

  return fill ? (
    <Image src={src} alt={alt} fill sizes={sizes} className={className} priority={priority} />
  ) : (
    <Image
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
    />
  );
}
