"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const TOPICS = ["rice", "potato", "onion", "tomato", "disease", "pest", "irrigation", "greenhouse"];

/** Filter lives in the URL, so a topic view can be shared or bookmarked. */
export function TopicFilter({ current }: { current: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      <Link
        href="/forum"
        className={cn(
          "rounded-pill px-3 py-1.5 text-xs font-medium transition-colors",
          !current ? "bg-canopy text-ink-invert" : "bg-surface-sunk text-ink-soft hover:text-ink"
        )}
      >
        All
      </Link>
      {TOPICS.map((topic) => (
        <Link
          key={topic}
          href={`/forum?topic=${topic}`}
          className={cn(
            "rounded-pill px-3 py-1.5 text-xs font-medium capitalize transition-colors",
            current === topic ? "bg-canopy text-ink-invert" : "bg-surface-sunk text-ink-soft hover:text-ink"
          )}
        >
          {topic}
        </Link>
      ))}
    </div>
  );
}
