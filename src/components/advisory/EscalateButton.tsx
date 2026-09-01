"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { API_BASE } from "@/lib/config";
import { apiCall } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import type { User } from "@/lib/types";

/**
 * Hands the conversation to a verified human expert.
 *
 * The list of experts is fetched only when the panel opens, so the page does
 * not pay for it on every visit.
 */
export function EscalateButton({ sessionId }: { sessionId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [experts, setExperts] = useState<User[] | null>(null);
  const [busy, setBusy] = useState(false);

  const openPanel = async () => {
    setOpen(true);
    if (experts) return;
    try {
      // A dedicated endpoint: listing all users is admin-only, and a farmer
      // must be able to pick an expert without that access.
      const res = await fetch(`${API_BASE}/user/experts`, {
        credentials: "include",
      });
      const body = await res.json();
      setExperts(body.data ?? []);
    } catch {
      setExperts([]);
    }
  };

  const assign = async (expertId: string) => {
    setBusy(true);
    try {
      await apiCall(`/advisory/${sessionId}/assign-expert`, "PATCH", { expertId });
      toast.success("An expert has been added to this conversation");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not assign an expert");
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={openPanel}>
        <Stethoscope className="h-4 w-4" />
        Ask a human expert
      </Button>
    );
  }

  return (
    <div className="rounded-card bg-surface p-4 card-shadow">
      <p className="text-sm font-medium">Choose an expert</p>
      <p className="mt-0.5 text-xs text-ink-faint">
        They will see this whole conversation, so nothing needs retyping.
      </p>

      {experts === null ? (
        <div className="mt-4 flex items-center gap-2 text-sm text-ink-soft">
          <Loader2 className="h-4 w-4 animate-spin" /> Finding experts…
        </div>
      ) : experts.length === 0 ? (
        <p className="mt-4 text-sm text-ink-soft">
          No verified experts are available yet. The AI advisor can keep helping
          in the meantime.
        </p>
      ) : (
        <ul className="mt-3 space-y-2">
          {experts.map((expert) => (
            <li key={expert._id}>
              <button
                disabled={busy}
                onClick={() => assign(expert.userCode)}
                className="flex w-full items-center gap-3 rounded-tile bg-surface-sunk px-3 py-2.5 text-left transition-colors hover:bg-canopy-tint disabled:opacity-60"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-canopy text-[0.625rem] font-semibold text-ink-invert">
                  {expert.fullName.slice(0, 2).toUpperCase()}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{expert.fullName}</span>
                  <span className="block truncate text-xs text-ink-faint">
                    {expert.designations?.[0]?.designationTitle ?? "Verified expert"}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <button
        onClick={() => setOpen(false)}
        className="mt-3 text-xs text-ink-soft hover:text-ink"
      >
        Cancel
      </button>
    </div>
  );
}
