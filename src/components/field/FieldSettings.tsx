"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Settings2, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { apiCall } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import type { Field } from "@/lib/types";

const STATUSES = ["active", "inactive", "maintenance"] as const;

export function FieldSettings({ field }: { field: Field }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(field.fieldName);
  const [crop, setCrop] = useState(field.fieldCrop);
  const [status, setStatus] = useState(field.fieldStatus ?? "active");
  const [saving, setSaving] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const save = async () => {
    setSaving(true);
    try {
      await apiCall(`/field/${field.fieldId}`, "PATCH", {
        fieldName: name.trim(),
        fieldCrop: crop.trim(),
        fieldStatus: status,
      });
      toast.success("Field updated");
      setOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setDeleting(true);
    try {
      await apiCall(`/field/${field.fieldId}`, "DELETE");
      toast.success(`${field.fieldName} removed`);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not remove the field");
      setDeleting(false);
    }
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>
        <Settings2 className="h-4 w-4" />
        Field settings
      </Button>
    );
  }

  return (
    <div className="rounded-card bg-surface p-5 card-shadow">
      <h3 className="text-sm font-semibold">Field settings</h3>

      <div className="mt-4 space-y-3">
        <div>
          <Label>Name</Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <Label>Crop</Label>
          <Input value={crop} onChange={(e) => setCrop(e.target.value)} />
        </div>
        <div>
          <Label>Status</Label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as typeof status)}
            className="w-full rounded-tile border border-line bg-surface px-4 py-3 text-sm capitalize text-ink focus:border-canopy focus:outline-none focus:ring-2 focus:ring-canopy/15"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex gap-2">
        <Button size="sm" onClick={save} disabled={saving}>
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>

      <div className="mt-5 border-t border-line-soft pt-4">
        {confirming ? (
          <div>
            {/* Says exactly what is lost, so the confirmation is informed. */}
            <p className="text-sm text-ink">
              Remove <span className="font-medium">{field.fieldName}</span>?
            </p>
            <p className="mt-1 text-xs text-ink-soft">
              Its readings are kept but the field stops appearing on your
              dashboard and no longer accepts commands.
            </p>
            <div className="mt-3 flex gap-2">
              <Button
                size="sm"
                onClick={remove}
                disabled={deleting}
                className="bg-alert text-ink-invert hover:bg-alert/90"
              >
                {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Yes, remove it
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                Keep it
              </Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setConfirming(true)}
            className="inline-flex items-center gap-1.5 text-xs text-alert hover:underline"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Remove this field
          </button>
        )}
      </div>
    </div>
  );
}
