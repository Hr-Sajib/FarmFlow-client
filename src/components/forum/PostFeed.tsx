"use client";

import { useState } from "react";
import type { Post, User } from "@/lib/types";
import { PostCard } from "./PostCard";

/** Holds the list so a removal takes effect immediately. */
export function PostFeed({ posts, user }: { posts: Post[]; user: User }) {
  const [list, setList] = useState(posts);

  return (
    <div className="mt-5 space-y-4">
      {list.map((post) => (
        <PostCard
          key={post._id}
          post={post}
          user={user}
          onRemoved={(id) => setList((prev) => prev.filter((p) => p._id !== id))}
        />
      ))}
    </div>
  );
}
