"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, X } from "lucide-react";
import { toast } from "sonner";

import { uploadFiles } from "@/lib/session";
import { cn } from "@/lib/utils";

export function ImageUpload({
  value,
  onChange,
  category,
  label = "Photo",
  className,
}: {
  value: string | null;
  onChange: (url: string | null) => void;
  category: "profile" | "fields" | "posts" | "advisory" | "documents";
  label?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  const handleFiles = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;

    setBusy(true);
    try {
      const [uploaded] = await uploadFiles([file], category);
      onChange(uploaded.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  };

  if (value) {
    return (
      <div className={cn("relative overflow-hidden rounded-tile", className)}>
        <Image src={value} alt="" width={640} height={240} className="h-40 w-full object-cover" />
        <button
          type="button"
          onClick={() => onChange(null)}
          aria-label="Remove photo"
          className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-bark/70 text-ink-invert transition-colors hover:bg-bark"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    );
  }

  return (
    <div className={className}>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <button
        type="button"
        disabled={busy}
        onClick={() => inputRef.current?.click()}
        className="flex h-40 w-full flex-col items-center justify-center gap-2 rounded-tile border border-dashed border-line bg-surface-sunk text-ink-soft transition-colors hover:border-canopy hover:text-canopy disabled:opacity-60"
      >
        {busy ? (
          <>
            <Loader2 className="h-5 w-5 animate-spin" />
            <span className="text-xs">Uploading</span>
          </>
        ) : (
          <>
            <ImagePlus className="h-5 w-5" strokeWidth={1.85} />
            <span className="text-xs">{label}</span>
            <span className="text-[0.6875rem] text-ink-faint">JPG, PNG or WebP</span>
          </>
        )}
      </button>
    </div>
  );
}
