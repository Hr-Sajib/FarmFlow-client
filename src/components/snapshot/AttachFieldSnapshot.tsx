"use client";

import { useEffect, useState } from "react";
import { Loader2, Sprout } from "lucide-react";
import { toast } from "sonner";

import { API_BASE } from "@/lib/config";
import type { Field, FieldSnapshot } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

/**
 * Picks one of the farmer's fields and captures it.
 *
 * The capture happens on the server, not here: the reading, soil profile and
 * forecast have to be assembled from three sources, and a snapshot built in the
 * browser could be edited before it was sent — which would make it worthless as
 * the thing an expert reasons from.
 */
export function AttachFieldSnapshot({
  onAttach,
  disabled,
}: {
  onAttach: (snapshot: FieldSnapshot) => void;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [fields, setFields] = useState<Field[] | null>(null);
  const [capturing, setCapturing] = useState<string | null>(null);

  useEffect(() => {
    if (!open || fields) return;
    let cancelled = false;

    void (async () => {
      try {
        const res = await fetch(`${API_BASE}/field/myFields`, {
          credentials: "include",
        });
        const body = await res.json();
        if (!cancelled) setFields(res.ok ? (body.data ?? []) : []);
      } catch {
        if (!cancelled) setFields([]);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, fields]);

  const capture = async (fieldId: string) => {
    setCapturing(fieldId);
    try {
      const res = await fetch(`${API_BASE}/field/${fieldId}/snapshot`, {
        credentials: "include",
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.message ?? "Could not capture the field");
      onAttach(body.data as FieldSnapshot);
      setOpen(false);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not capture the field"
      );
    } finally {
      setCapturing(null);
    }
  };

  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        disabled={disabled}
        onClick={() => setOpen(true)}
      >
        <Sprout className="h-4 w-4" />
        Attach field snapshot
      </Button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        label="Attach a field snapshot"
        className="max-w-md"
      >
        <h2 className="font-display text-lg font-semibold tracking-tight">
          Attach a field snapshot
        </h2>
        <p className="mt-1 text-sm text-ink-soft">
          Sends the field&rsquo;s details, its latest reading, the soil profile
          and the local forecast as they are right now.
        </p>

        <div className="mt-5 space-y-2">
          {fields === null ? (
            <p className="flex items-center gap-2 text-sm text-ink-soft">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading your fields…
            </p>
          ) : fields.length === 0 ? (
            <p className="text-sm text-ink-faint">
              You have no fields to attach yet.
            </p>
          ) : (
            fields.map((field) => (
              <button
                key={field.fieldId}
                type="button"
                disabled={capturing !== null}
                onClick={() => capture(field.fieldId)}
                className="flex w-full items-center gap-3 rounded-tile bg-surface-sunk px-4 py-3 text-left transition-colors hover:bg-canopy-tint disabled:opacity-60"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-tile bg-canopy text-ink-invert">
                  {capturing === field.fieldId ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sprout className="h-4 w-4" strokeWidth={1.9} />
                  )}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">
                    {field.fieldName}
                  </span>
                  <span className="block truncate text-xs capitalize text-ink-faint">
                    {field.fieldCrop}
                  </span>
                </span>
              </button>
            ))
          )}
        </div>
      </Modal>
    </>
  );
}
