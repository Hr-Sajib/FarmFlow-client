"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Pencil, Trash2, X } from "lucide-react";
import { toast } from "sonner";

import { apiCall } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { Modal } from "@/components/ui/Modal";
import { AutoHeight } from "@/components/ui/AutoHeight";
import type { Field } from "@/lib/types";

const SOIL_TYPES = ["clay", "loam", "sandy", "silt", "peat", "chalk", "saline"] as const;
const STATUSES = ["active", "inactive", "maintenance"] as const;
const ENVIRONMENTS = [
  { value: "greenhouse", label: "Greenhouse" },
  { value: "net_house", label: "Net house" },
  { value: "open_field", label: "Open field" },
] as const;

const selectClass =
  "w-full rounded-tile border border-line bg-surface px-4 py-3 text-sm capitalize text-ink focus:border-canopy focus:outline-none focus:ring-2 focus:ring-canopy/15";

/**
 * Editing lives behind the pencil on the field header, so the thing being
 * changed is on screen while you change it.
 *
 * The field id is shown but never sent. It is the identifier telemetry is
 * stored against, so renaming it would orphan every reading the field has —
 * the update schema on the server rejects it outright, and this form has no
 * input that could produce it.
 */
export function EditFieldDialog({ field }: { field: Field }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const [form, setForm] = useState({
    fieldName: field.fieldName,
    fieldCrop: field.fieldCrop,
    fieldSizeInAcres: field.fieldSizeInAcres?.toString() ?? "",
    soilType: field.soilType ?? "",
    environmentType: field.environmentType,
    fieldStatus: field.fieldStatus ?? "active",
    fieldImage: field.fieldImage || "",
  });

  const set = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const save = async () => {
    const name = form.fieldName.trim();
    const crop = form.fieldCrop.trim();

    if (!name || !crop) {
      toast.error("Name and crop cannot be empty");
      return;
    }

    // The server schema is strict, so only keys it accepts may be sent — and
    // only the ones that actually changed, so a PATCH stays a PATCH.
    const payload: Record<string, unknown> = {};
    if (name !== field.fieldName) payload.fieldName = name;
    if (crop !== field.fieldCrop) payload.fieldCrop = crop;
    if (form.environmentType !== field.environmentType)
      payload.environmentType = form.environmentType;
    if (form.fieldStatus !== (field.fieldStatus ?? "active"))
      payload.fieldStatus = form.fieldStatus;
    if (form.soilType && form.soilType !== field.soilType)
      payload.soilType = form.soilType;
    if (form.fieldImage && form.fieldImage !== field.fieldImage)
      payload.fieldImage = form.fieldImage;

    const size = form.fieldSizeInAcres.trim();
    if (size !== (field.fieldSizeInAcres?.toString() ?? "")) {
      const parsed = Number(size);
      if (size && (Number.isNaN(parsed) || parsed < 0)) {
        toast.error("Size must be a number of acres, or left blank");
        return;
      }
      if (size) payload.fieldSizeInAcres = parsed;
    }

    if (Object.keys(payload).length === 0) {
      setOpen(false);
      return;
    }

    setSaving(true);
    try {
      await apiCall(`/field/${field.fieldId}`, "PATCH", payload);
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
      router.push("/overview");
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not remove the field"
      );
      setDeleting(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Edit ${field.fieldName}`}
        className="flex h-9 w-9 items-center justify-center rounded-tile bg-bark/50 text-ink-invert backdrop-blur transition-colors duration-200 hover:bg-bark/75"
      >
        <Pencil className="h-4 w-4" strokeWidth={1.85} />
      </button>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        label={`Edit ${field.fieldName}`}
        className="max-w-lg"
      >
      <div>
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-lg font-semibold tracking-tight">
              Edit field
            </h2>
            {/* Shown because it is what the device reports against and what
                support would ask for — but it is not an input. */}
            <p className="mt-1 text-xs text-ink-faint">
              ID <span className="tabular text-ink-soft">{field.fieldId}</span> ·
              cannot be changed
            </p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Close"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-tile text-ink-faint transition-colors hover:bg-surface-sunk hover:text-ink"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4">
          <ImageUpload
            value={form.fieldImage || null}
            onChange={(url) => set("fieldImage", url ?? "")}
            category="fields"
            label="Background image"
          />

          <div>
            <Label>Name</Label>
            <Input
              value={form.fieldName}
              onChange={(e) => set("fieldName", e.target.value)}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Crop</Label>
              <Input
                value={form.fieldCrop}
                onChange={(e) => set("fieldCrop", e.target.value)}
              />
            </div>
            <div>
              <Label>Size in acres</Label>
              <Input
                type="number"
                min="0"
                step="0.1"
                placeholder="Optional"
                value={form.fieldSizeInAcres}
                onChange={(e) => set("fieldSizeInAcres", e.target.value)}
              />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label>Environment</Label>
              <select
                value={form.environmentType}
                onChange={(e) =>
                  set("environmentType", e.target.value as Field["environmentType"])
                }
                className={selectClass}
              >
                {ENVIRONMENTS.map((env) => (
                  <option key={env.value} value={env.value}>
                    {env.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Soil type</Label>
              <select
                value={form.soilType}
                onChange={(e) => set("soilType", e.target.value)}
                className={selectClass}
              >
                <option value="">Not recorded</option>
                {SOIL_TYPES.map((soil) => (
                  <option key={soil} value={soil} className="capitalize">
                    {soil}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <Label>Status</Label>
            <select
              value={form.fieldStatus}
              onChange={(e) =>
                set("fieldStatus", e.target.value as (typeof STATUSES)[number])
              }
              className={selectClass}
            >
              {STATUSES.map((status) => (
                <option key={status} value={status} className="capitalize">
                  {status}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex gap-2">
          <Button onClick={save} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save changes
          </Button>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
        </div>

        <div className="mt-6 border-t border-line-soft pt-4">
          <AutoHeight>
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
                  {deleting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                  Yes, remove it
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setConfirming(false)}>
                  Keep it
                </Button>
              </div>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirming(true)}
              className="inline-flex items-center gap-1.5 text-xs text-alert hover:underline"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Remove this field
            </button>
          )}
          </AutoHeight>
        </div>
      </div>
      </Modal>
    </>
  );
}
