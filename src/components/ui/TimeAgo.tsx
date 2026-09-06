"use client";

import { useEffect, useState } from "react";

import { timeAgo } from "@/lib/utils";

/**
 * A relative timestamp that survives hydration.
 *
 * "18 min ago" is derived from the clock at the moment of render, and the
 * server's render and the client's happen seconds apart — far enough to cross
 * a minute boundary. React sees two different strings, calls it a mismatch and
 * throws the whole subtree away to re-render it.
 *
 * So the first paint is an absolute date, identical on both sides, and the
 * relative form replaces it once the client is running. It then re-ticks each
 * minute, which a plain server-rendered string never did — an open feed used
 * to say "2 min ago" for as long as it was left open.
 */
export function TimeAgo({
  value,
  className,
  prefix,
}: {
  value: string | Date;
  className?: string;
  prefix?: string;
}) {
  const iso = value instanceof Date ? value.toISOString() : value;
  const [relative, setRelative] = useState<string | null>(null);

  useEffect(() => {
    const tick = () => setRelative(timeAgo(iso));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [iso]);

  // Explicit locale and zone for the same reason: the default resolves against
  // the runtime, and Node's is not the browser's.
  const absolute = new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  });

  return (
    <span className={className}>
      {prefix}
      {relative ?? absolute}
    </span>
  );
}
