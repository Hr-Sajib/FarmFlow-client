"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { apiCall } from "@/lib/session";
import { ImageUpload } from "@/components/ui/ImageUpload";
import type { User } from "@/lib/types";

/**
 * Saves as soon as a photo is chosen. A separate save button for a single
 * control is a step with nothing in it, and the upload has already committed
 * the file by that point anyway.
 */
export function ProfilePhoto({ user }: { user: User }) {
  const router = useRouter();
  const [photo, setPhoto] = useState<string | null>(user.photo ?? null);

  const persist = async (url: string | null) => {
    const previous = photo;
    setPhoto(url);
    try {
      await apiCall(`/user/${user._id}`, "PATCH", { photo: url ?? "" });
      toast.success(url ? "Photo updated" : "Photo removed");
      router.refresh();
    } catch (error) {
      setPhoto(previous);
      toast.error(error instanceof Error ? error.message : "Could not save the photo");
    }
  };

  return (
    <section className="mb-6 rounded-card bg-surface p-5 card-shadow">
      <h2 className="font-display text-base font-semibold">Profile photo</h2>
      <p className="mt-1 text-sm text-ink-soft">
        Shown next to your name across the app.
      </p>
      <ImageUpload
        value={photo}
        onChange={persist}
        category="profile"
        label="Photo"
        className="mt-4"
      />
    </section>
  );
}
