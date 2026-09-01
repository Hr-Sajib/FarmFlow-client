import type { Metadata } from "next";
import { Users2 } from "lucide-react";

import { serverFetch } from "@/lib/api";
import type { Post, User } from "@/lib/types";
import { NewPostForm } from "@/components/forum/NewPostForm";
import { PostCard } from "@/components/forum/PostCard";

export const metadata: Metadata = { title: "Community" };

export default async function ForumPage({
  searchParams,
}: {
  searchParams: Promise<{ topic?: string }>;
}) {
  const { topic } = await searchParams;

  const [user, posts] = await Promise.all([
    serverFetch<User>("/user/me"),
    serverFetch<Post[]>(`/post${topic ? `?topic=${topic}` : ""}`),
  ]);

  if (!user) return null;
  const list = posts ?? [];

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 lg:py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">
          Community
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          What other growers are seeing, and what worked for them.
        </p>
      </header>

      <NewPostForm user={user} />

      {list.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-line bg-surface/60 px-8 py-14 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
            <Users2 className="h-5 w-5" strokeWidth={1.85} />
          </span>
          <h2 className="font-display text-lg font-semibold">Nothing here yet</h2>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-soft">
            Be the first to post. A question about a crop you&apos;re growing is a
            good place to start.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {list.map((post) => (
            <PostCard key={post._id} post={post} user={user} />
          ))}
        </div>
      )}
    </div>
  );
}
