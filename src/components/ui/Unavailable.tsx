"use client";

import { useRouter } from "next/navigation";
import { PlugZap, RotateCw } from "lucide-react";

import { Button } from "@/components/ui/Button";

/**
 * Shown when a request failed, as distinct from succeeding with nothing in it.
 *
 * `serverFetch` returns null for both, and collapsing them with `?? []` renders
 * an unreachable backend as "you have no fields" — which reads as data loss and
 * sends the farmer to a create form that will fail too. The two states get
 * different words and different actions.
 */
export function Unavailable({ what }: { what: string }) {
  const router = useRouter();

  return (
    <div className="rounded-card border border-dashed border-line bg-surface/60 px-8 py-16 text-center">
      <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-tile bg-surface-sunk text-ink-faint">
        <PlugZap className="h-5 w-5" strokeWidth={1.85} />
      </span>
      <h2 className="font-display text-lg font-semibold">
        Couldn&rsquo;t load {what}
      </h2>
      <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-soft">
        The server didn&rsquo;t answer. Your data is safe — this is a connection
        problem, not a missing record.
      </p>
      <Button variant="outline" className="mt-6" onClick={() => router.refresh()}>
        <RotateCw className="h-4 w-4" />
        Try again
      </Button>
    </div>
  );
}
