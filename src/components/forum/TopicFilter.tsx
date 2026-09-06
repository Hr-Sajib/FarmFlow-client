"use client";

import { cn } from "@/lib/utils";

const TOPICS = [
  "rice", "potato", "onion", "tomato", "vegetables",
  "disease", "pest", "weed",
  "irrigation", "fertilizer", "soil",
  "greenhouse", "weather", "harvest", "market",
];

/**
 * Tags are multi-select and drive the query rather than the URL.
 *
 * They combine with the search box and with paging, and holding three pieces
 * of state in the address bar means every keystroke is a navigation. Selecting
 * several narrows: the API matches posts carrying all of them.
 */
export function TopicFilter({
  selected,
  onChange,
}: {
  selected: string[];
  onChange: (topics: string[]) => void;
}) {
  const toggle = (topic: string) =>
    onChange(
      selected.includes(topic)
        ? selected.filter((t) => t !== topic)
        : [...selected, topic]
    );

  return (
    <div className="flex flex-wrap gap-1.5">
      <button
        type="button"
        onClick={() => onChange([])}
        className={cn(
          "rounded-pill px-3 py-1.5 text-xs font-medium transition-colors",
          selected.length === 0
            ? "bg-canopy text-ink-invert"
            : "bg-surface-sunk text-ink-soft hover:text-ink"
        )}
      >
        All
      </button>
      {TOPICS.map((topic) => {
        const on = selected.includes(topic);
        return (
          <button
            key={topic}
            type="button"
            aria-pressed={on}
            onClick={() => toggle(topic)}
            className={cn(
              "rounded-pill px-3 py-1.5 text-xs font-medium capitalize transition-colors",
              on
                ? "bg-canopy text-ink-invert"
                : "bg-surface-sunk text-ink-soft hover:text-ink"
            )}
          >
            {topic}
          </button>
        );
      })}
    </div>
  );
}
