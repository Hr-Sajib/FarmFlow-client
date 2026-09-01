"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input, Textarea, FormField, Label } from "@/components/ui/Field";
import { apiCall, uploadFiles } from "@/lib/session";
import type { AdvisorySession, Field } from "@/lib/types";

const schema = z.object({
  problemStatement: z
    .string()
    .min(5, "A short summary — at least a few words")
    .max(300, "Keep the summary under 300 characters"),
  problemDetails: z.string().max(5000).optional(),
  fieldId: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function NewSessionForm({ fields }: { fields: Field[] }) {
  const router = useRouter();
  const [media, setMedia] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const addPhotos = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    try {
      const uploaded = await uploadFiles(Array.from(files).slice(0, 4), "advisory");
      setMedia((prev) => [...prev, ...uploaded.map((u) => u.url)].slice(0, 4));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    try {
      const session = await apiCall<AdvisorySession>("/advisory", "POST", {
        problemStatement: values.problemStatement,
        ...(values.problemDetails ? { problemDetails: values.problemDetails } : {}),
        ...(values.fieldId ? { fieldId: values.fieldId } : {}),
        attachedMediaUrls: media,
      });
      router.refresh();
      router.push(`/advisory/${session._id}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start the session");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      <FormField label="What's wrong?" error={errors.problemStatement?.message}>
        <Input
          placeholder="Lower leaves on my tomatoes are yellowing"
          invalid={Boolean(errors.problemStatement)}
          {...register("problemStatement")}
        />
      </FormField>

      <FormField
        label="Any more detail?"
        hint="When it started, what you've already tried — optional"
        error={errors.problemDetails?.message}
      >
        <Textarea rows={4} placeholder="Started three days ago, mostly on the older leaves…" {...register("problemDetails")} />
      </FormField>

      {fields.length ? (
        <div>
          <Label>Which field?</Label>
          <select
            {...register("fieldId")}
            className="w-full rounded-tile border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-canopy focus:outline-none focus:ring-2 focus:ring-canopy/15"
          >
            <option value="">Not about a specific field</option>
            {fields.map((f) => (
              <option key={f.fieldId} value={f.fieldId}>
                {f.fieldName} · {f.fieldCrop}
              </option>
            ))}
          </select>
          <p className="mt-1.5 text-xs text-ink-faint">
            Linking a field lets the advisor read its live sensor values and soil profile.
          </p>
        </div>
      ) : null}

      <div>
        <Label>Photos</Label>
        <div className="flex flex-wrap gap-2">
          {media.map((url) => (
            <div key={url} className="relative h-24 w-24 overflow-hidden rounded-tile">
              <Image src={url} alt="" fill sizes="96px" className="object-cover" />
              <button
                type="button"
                aria-label="Remove photo"
                onClick={() => setMedia((prev) => prev.filter((u) => u !== url))}
                className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-bark/70 text-ink-invert"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}

          {media.length < 4 ? (
            <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-tile border border-dashed border-line bg-surface-sunk text-ink-soft transition-colors hover:border-canopy hover:text-canopy">
              <input
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                onChange={(e) => addPhotos(e.target.files)}
              />
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <>
                  <ImagePlus className="h-4 w-4" strokeWidth={1.85} />
                  <span className="text-[0.625rem]">Add</span>
                </>
              )}
            </label>
          ) : null}
        </div>
      </div>

      <Button type="submit" size="lg" disabled={submitting || uploading} className="w-full">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Starting
          </>
        ) : (
          "Ask the advisor"
        )}
      </Button>
    </form>
  );
}
