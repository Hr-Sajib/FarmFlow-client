"use client";

import { useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/Button";

/**
 * Catches render failures anywhere below the root. States what happened and
 * offers the one action that helps, rather than showing a stack trace.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled render error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          That didn&apos;t load
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          Something went wrong on our side. Your data is safe — trying again
          usually works.
        </p>
        <Button onClick={reset} className="mt-6">
          <RefreshCw className="h-4 w-4" />
          Try again
        </Button>
        {error.digest ? (
          <p className="tabular mt-4 text-xs text-ink-faint">
            Reference: {error.digest}
          </p>
        ) : null}
      </div>
    </div>
  );
}
