"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Clock, FileText, Loader2, Plus, Upload } from "lucide-react";
import { toast } from "sonner";

import { apiCall, uploadFiles } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import type { Designation, User } from "@/lib/types";

/**
 * Experts register with their credentials as text, then upload supporting
 * documents here — uploads require a session, which does not exist during
 * registration.
 *
 * Documents are stored under `documents/`, which the API serves only to an
 * authenticated caller.
 */
export function DesignationPanel({ user }: { user: User }) {
  const router = useRouter();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [from, setFrom] = useState("");
  const [docs, setDocs] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const existing = user.designations ?? [];

  const addDocs = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded = await uploadFiles(Array.from(files).slice(0, 3), "documents");
      setDocs((prev) => [...prev, ...uploaded.map((u) => u.url)]);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    if (!title.trim() || !from.trim()) {
      toast.error("Add both the designation and the institution");
      return;
    }
    // Without proof there is nothing for the reviewing admin to check, so the
    // submission is stopped here rather than queued for a decision that
    // cannot be made. The server enforces the same rule.
    if (!docs.length) {
      toast.error("Attach at least one supporting document");
      return;
    }
    setSaving(true);
    try {
      await apiCall(`/user/${user._id}`, "PATCH", {
        designations: [
          ...existing.map((d) => ({
            designationTitle: d.designationTitle,
            designatedFrom: d.designatedFrom,
            documents: d.documents,
          })),
          { designationTitle: title.trim(), designatedFrom: from.trim(), documents: docs },
        ],
      });
      toast.success("Credential submitted for review");
      setAdding(false);
      setTitle("");
      setFrom("");
      setDocs([]);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="mb-6 rounded-card bg-surface p-5 card-shadow">
      <h2 className="font-display text-base font-semibold">Your credentials</h2>
      <p className="mt-1 text-sm text-ink-soft">
        An admin reviews these before you can answer escalated questions.
      </p>

      {existing.length ? (
        <ul className="mt-4 space-y-2.5">
          {existing.map((d: Designation) => (
            <li
              key={d._id ?? d.designationTitle}
              className="flex items-start gap-3 rounded-tile bg-surface-sunk px-4 py-3"
            >
              <span
                className={
                  d.isApproved
                    ? "mt-0.5 text-canopy"
                    : "mt-0.5 text-warn"
                }
              >
                {d.isApproved ? (
                  <BadgeCheck className="h-4 w-4" />
                ) : (
                  <Clock className="h-4 w-4" />
                )}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{d.designationTitle}</p>
                <p className="text-xs text-ink-soft">{d.designatedFrom}</p>
                <p className="mt-1 text-xs text-ink-faint">
                  {d.isApproved ? "Approved" : "Awaiting review"}
                  {d.documents?.length ? ` · ${d.documents.length} document(s)` : " · no documents"}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-ink-faint">Nothing submitted yet.</p>
      )}

      {adding ? (
        <div className="mt-4 space-y-3 rounded-tile bg-surface-sunk p-4">
          <div>
            <Label>Designation</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Senior Agronomist" />
          </div>
          <div>
            <Label>Institution</Label>
            <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Bangladesh Agricultural Research Institute" />
          </div>

          <div>
            <Label>Supporting documents (required)</Label>
            <label className="flex cursor-pointer items-center gap-2 rounded-tile border border-dashed border-line bg-surface px-4 py-3 text-sm text-ink-soft transition-colors hover:border-canopy hover:text-canopy">
              <input
                type="file"
                accept="image/*,application/pdf"
                multiple
                className="sr-only"
                onChange={(e) => addDocs(e.target.files)}
              />
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {docs.length ? `${docs.length} attached` : "Certificate, ID or appointment letter"}
            </label>
            {docs.length ? (
              <ul className="mt-2 space-y-1">
                {docs.map((d, i) => (
                  <li key={d} className="flex items-center gap-1.5 text-xs text-ink-soft">
                    <FileText className="h-3 w-3" /> Document {i + 1}
                  </li>
                ))}
              </ul>
            ) : null}
          </div>

          <div className="flex gap-2">
            <Button size="sm" onClick={save} disabled={saving || uploading || !docs.length}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              Submit for review
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setAdding(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" variant="outline" className="mt-4" onClick={() => setAdding(true)}>
          <Plus className="h-4 w-4" />
          Add a credential
        </Button>
      )}
    </section>
  );
}
