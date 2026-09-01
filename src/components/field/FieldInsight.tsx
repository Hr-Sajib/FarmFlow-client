"use client";

import { useState } from "react";
import { Sparkles, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { API_BASE } from "@/lib/config";
import { Button } from "@/components/ui/Button";

type InsightPayload = {
  insight: string;
  generatedAt: string;
  basedOn: { soil: Record<string, number> | null };
};

/**
 * Advice is generated on demand rather than with the page: a model call takes
 * seconds and costs quota, so it should not be spent every time someone opens
 * a field to glance at a number.
 */
export function FieldInsight({ fieldId }: { fieldId: string }) {
  const [data, setData] = useState<InsightPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [detail, setDetail] = useState<"brief" | "full">("brief");

  const load = async (level: "brief" | "full") => {
    setLoading(true);
    setDetail(level);
    try {
      const res = await fetch(
        `${API_BASE}/field/${fieldId}/insight?detail=${level}`,
        { credentials: "include" }
      );
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message ?? "Could not generate advice");
      setData(body.data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not generate advice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-card bg-surface p-5 card-shadow">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
            <Sparkles className="h-4 w-4" strokeWidth={1.9} />
          </span>
          <div>
            <h3 className="text-sm font-semibold">What to do now</h3>
            <p className="text-[0.6875rem] text-ink-faint">
              From this field&apos;s readings and soil profile
            </p>
          </div>
        </div>

        {data ? (
          <button
            onClick={() => load(detail)}
            disabled={loading}
            aria-label="Regenerate advice"
            className="rounded-pill p-2 text-ink-faint transition-colors hover:bg-surface-sunk hover:text-ink disabled:opacity-50"
          >
            <RefreshCw className={loading ? "h-4 w-4 animate-spin" : "h-4 w-4"} />
          </button>
        ) : null}
      </div>

      {!data && !loading ? (
        <div className="mt-4">
          <p className="text-sm leading-relaxed text-ink-soft">
            Get a recommendation based on the latest reading, the crop on
            record, and the soil at these coordinates.
          </p>
          <Button size="sm" className="mt-4" onClick={() => load("brief")}>
            Generate advice
          </Button>
        </div>
      ) : null}

      {loading ? (
        <div className="mt-5 flex items-center gap-2.5 text-sm text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" />
          Reading the field&apos;s numbers…
        </div>
      ) : null}

      {data && !loading ? (
        <>
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-ink">
            {data.insight}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {detail === "brief" ? (
              <Button size="sm" variant="outline" onClick={() => load("full")}>
                Explain in more depth
              </Button>
            ) : (
              <Button size="sm" variant="outline" onClick={() => load("brief")}>
                Show the short version
              </Button>
            )}
            {data.basedOn.soil ? (
              <span className="text-[0.6875rem] text-ink-faint">
                Includes soil profile for these coordinates
              </span>
            ) : (
              <span className="text-[0.6875rem] text-ink-faint">
                No soil survey coverage at these coordinates
              </span>
            )}
          </div>
        </>
      ) : null}
    </div>
  );
}
