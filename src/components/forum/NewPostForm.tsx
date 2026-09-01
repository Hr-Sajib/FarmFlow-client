"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ImagePlus, Loader2, X } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";

import { apiCall, uploadFiles } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";

const TOPICS = [
  "rice", "potato", "onion", "tomato", "disease", "pest",
  "fertilizer", "irrigation", "soil", "weather", "greenhouse", "harvest",
];

export function NewPostForm({ user }: { user: User }) {
  const router = useRouter();
  const [text, setText] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [topics, setTopics] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);

  const toggleTopic = (topic: string) =>
    setTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : prev.length < 5
        ? [...prev, topic]
        : prev
    );

  const addImage = async (files: FileList | null) => {
    const file = files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const [uploaded] = await uploadFiles([file], "posts");
      setImage(uploaded.url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;

    setPosting(true);
    try {
      await apiCall("/post", "POST", {
        postText: text.trim(),
        ...(image ? { postImage: image } : {}),
        postTopics: topics,
      });
      setText("");
      setImage(null);
      setTopics([]);
      router.refresh();
      toast.success("Posted to the community");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not post");
    } finally {
      setPosting(false);
    }
  };

  return (
    <form onSubmit={submit} className="rounded-card bg-surface p-5 card-shadow">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canopy-tint text-xs font-semibold text-canopy">
          {user.fullName.slice(0, 2).toUpperCase()}
        </span>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={3}
          placeholder="Ask the community, or share what worked on your farm…"
          className="flex-1 resize-none rounded-tile border border-line bg-surface px-4 py-3 text-sm placeholder:text-ink-faint focus:border-canopy focus:outline-none focus:ring-2 focus:ring-canopy/15"
        />
      </div>

      {image ? (
        <div className="relative mt-3 overflow-hidden rounded-tile">
          <Image src={image} alt="" width={800} height={300} className="max-h-64 w-full object-cover" />
          <button
            type="button"
            onClick={() => setImage(null)}
            aria-label="Remove image"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-bark/70 text-ink-invert"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-1.5">
        {TOPICS.map((topic) => (
          <button
            key={topic}
            type="button"
            onClick={() => toggleTopic(topic)}
            aria-pressed={topics.includes(topic)}
            className={cn(
              "rounded-pill px-3 py-1 text-xs capitalize transition-colors",
              topics.includes(topic)
                ? "bg-canopy text-ink-invert"
                : "bg-surface-sunk text-ink-soft hover:text-ink"
            )}
          >
            {topic}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between gap-3">
        <label className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-canopy">
          <input type="file" accept="image/*" className="sr-only" onChange={(e) => addImage(e.target.files)} />
          {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" strokeWidth={1.9} />}
          Photo
        </label>

        <Button type="submit" disabled={posting || uploading || !text.trim()}>
          {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Post
        </Button>
      </div>
    </form>
  );
}
