"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Star } from "lucide-react";
import { toast } from "sonner";

import { apiCall } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Field";
import { cn } from "@/lib/utils";
import type { AdvisorySession, User } from "@/lib/types";

/**
 * Closing the loop: an expert or the owning farmer can mark a session resolved,
 * and the farmer can then say whether the advice actually helped.
 */
export function SessionActions({
  session,
  user,
}: {
  session: AdvisorySession;
  user: User;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [stars, setStars] = useState(session.feedbackStarCount ?? 0);
  const [note, setNote] = useState(session.feedbackText ?? "");
  const [rating, setRating] = useState(false);

  const isOwner = session.farmerId === user.userCode;
  const isAssigned = session.expertId === user.userCode;
  const open = session.status !== "resolved" && session.status !== "closed";
  const alreadyRated = Boolean(session.feedbackStarCount);

  const resolve = async () => {
    setBusy(true);
    try {
      await apiCall(`/advisory/${session._id}/status`, "PATCH", { status: "resolved" });
      toast.success("Marked as resolved");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update");
    } finally {
      setBusy(false);
    }
  };

  const submitFeedback = async () => {
    if (!stars) return;
    setBusy(true);
    try {
      await apiCall(`/advisory/${session._id}/feedback`, "POST", {
        feedbackStarCount: stars,
        ...(note.trim() ? { feedbackText: note.trim() } : {}),
      });
      toast.success("Thanks — that helps us improve the advice");
      setRating(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save your feedback");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {open && (isOwner || isAssigned || user.role === "admin") ? (
        <Button size="sm" variant="outline" onClick={resolve} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
          Mark resolved
        </Button>
      ) : null}

      {!open && isOwner && !alreadyRated && !rating ? (
        <Button size="sm" variant="outline" onClick={() => setRating(true)}>
          <Star className="h-4 w-4" />
          Rate this advice
        </Button>
      ) : null}

      {alreadyRated ? (
        <span className="flex items-center gap-1 text-xs text-ink-faint">
          {Array.from({ length: 5 }, (_, i) => (
            <Star
              key={i}
              className={cn(
                "h-3.5 w-3.5",
                i < (session.feedbackStarCount ?? 0)
                  ? "fill-shoot-deep text-shoot-deep"
                  : "text-line"
              )}
            />
          ))}
          <span className="ml-1">your rating</span>
        </span>
      ) : null}

      {rating ? (
        <div className="w-full rounded-card bg-surface p-4 card-shadow">
          <p className="text-sm font-medium">Did this advice help?</p>

          <div className="mt-3 flex gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button
                key={n}
                onClick={() => setStars(n)}
                aria-label={`${n} star${n > 1 ? "s" : ""}`}
                className="p-1"
              >
                <Star
                  className={cn(
                    "h-6 w-6 transition-colors",
                    n <= stars ? "fill-shoot-deep text-shoot-deep" : "text-line hover:text-ink-faint"
                  )}
                />
              </button>
            ))}
          </div>

          <Textarea
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Anything that was wrong or missing? Optional."
            className="mt-3"
          />

          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={submitFeedback} disabled={busy || !stars}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Send feedback
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setRating(false)}>
              Not now
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
