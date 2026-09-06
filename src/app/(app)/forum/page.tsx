import type { Metadata } from "next";

import { serverFetch } from "@/lib/api";
import type { PostPage, User } from "@/lib/types";
import { NewPostForm } from "@/components/forum/NewPostForm";
import { PostFeed } from "@/components/forum/PostFeed";

export const metadata: Metadata = { title: "Community" };

/**
 * The first page is rendered on the server so the feed arrives with posts in
 * it; everything after that — searching, filtering, scrolling — is the client
 * talking to the API directly.
 */
export default async function ForumPage() {
  const [user, first] = await Promise.all([
    serverFetch<User>("/user/me"),
    serverFetch<PostPage>("/post"),
  ]);

  if (!user) return null;

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

      {/* null here means the first request failed; the feed says so itself. */}
      <PostFeed initial={first} user={user} />
    </div>
  );
}
