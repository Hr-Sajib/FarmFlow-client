"use client";

import { useState } from "react";
import Image from "next/image";
import { ThumbsDown, ThumbsUp, MessageSquare, BadgeCheck, Send } from "lucide-react";
import { toast } from "sonner";

import { apiCall } from "@/lib/session";
import { cn, timeAgo } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import type { Post, User } from "@/lib/types";

type Reaction = "like" | "dislike" | null;

export function PostCard({ post, user }: { post: Post; user: User }) {
  const mine: Reaction = post.reactions.likes.includes(user._id)
    ? "like"
    : post.reactions.dislikes.includes(user._id)
    ? "dislike"
    : null;

  const [counts, setCounts] = useState({
    like: post.reactions.likes.length,
    dislike: post.reactions.dislikes.length,
    mine,
  });
  const [comments, setComments] = useState(post.comments);
  const [draft, setDraft] = useState("");
  const [showComments, setShowComments] = useState(false);
  const [busy, setBusy] = useState(false);

  /**
   * The reaction is applied locally first. The server enforces one reaction per
   * user atomically, so the only job here is to make the tap feel immediate and
   * roll back if the request fails.
   */
  const react = async (choice: "like" | "dislike") => {
    const before = counts;
    const isUndo = counts.mine === choice;

    setCounts((c) => {
      const next = { ...c };
      if (c.mine === "like") next.like -= 1;
      if (c.mine === "dislike") next.dislike -= 1;
      if (!isUndo) next[choice] += 1;
      next.mine = isUndo ? null : choice;
      return next;
    });

    try {
      if (isUndo) {
        await apiCall(`/post/${post._id}/react`, "DELETE");
      } else {
        await apiCall(`/post/${post._id}/react`, "POST", { reaction: choice });
      }
    } catch (error) {
      setCounts(before);
      toast.error(error instanceof Error ? error.message : "Could not save your reaction");
    }
  };

  const comment = async (e: React.FormEvent) => {
    e.preventDefault();
    const text = draft.trim();
    if (!text) return;

    setBusy(true);
    try {
      const updated = await apiCall<Post>(`/post/${post._id}/comment`, "POST", {
        commentText: text,
      });
      setComments(updated.comments);
      setDraft("");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not post your comment");
    } finally {
      setBusy(false);
    }
  };

  const author = post.creatorId;

  return (
    <article className="rounded-card bg-surface p-5 card-shadow">
      <header className="flex items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-canopy-tint text-xs font-semibold text-canopy">
          {author?.photo ? (
            <Image src={author.photo} alt="" width={40} height={40} className="h-full w-full object-cover" />
          ) : (
            (author?.fullName ?? "?").slice(0, 2).toUpperCase()
          )}
        </span>
        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-medium">
            {author?.fullName ?? "Unknown"}
            {post.creatorRole === "expert" ? (
              <BadgeCheck className="h-4 w-4 shrink-0 text-canopy" aria-label="Verified expert" />
            ) : null}
          </p>
          <p className="text-xs text-ink-faint">{timeAgo(post.createdAt)}</p>
        </div>
        {post.region ? <Badge tone="neutral" className="capitalize">{post.region}</Badge> : null}
      </header>

      <p className="mt-3.5 whitespace-pre-line text-sm leading-relaxed text-ink">
        {post.postText}
      </p>

      {post.postImage ? (
        <div className="mt-3.5 overflow-hidden rounded-tile">
          <Image src={post.postImage} alt="" width={800} height={400} className="max-h-80 w-full object-cover" />
        </div>
      ) : null}

      {post.postTopics.length ? (
        <ul className="mt-3.5 flex flex-wrap gap-1.5">
          {post.postTopics.map((topic) => (
            <li key={topic}>
              <Badge tone="canopy" className="capitalize">{topic}</Badge>
            </li>
          ))}
        </ul>
      ) : null}

      <footer className="mt-4 flex items-center gap-1 border-t border-line-soft pt-3">
        <button
          onClick={() => react("like")}
          aria-pressed={counts.mine === "like"}
          className={cn(
            "flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm transition-colors",
            counts.mine === "like" ? "bg-canopy-tint text-canopy" : "text-ink-soft hover:bg-surface-sunk"
          )}
        >
          <ThumbsUp className="h-4 w-4" strokeWidth={1.9} />
          <span className="tabular">{counts.like}</span>
        </button>

        <button
          onClick={() => react("dislike")}
          aria-pressed={counts.mine === "dislike"}
          className={cn(
            "flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm transition-colors",
            counts.mine === "dislike" ? "bg-alert-tint text-alert" : "text-ink-soft hover:bg-surface-sunk"
          )}
        >
          <ThumbsDown className="h-4 w-4" strokeWidth={1.9} />
          <span className="tabular">{counts.dislike}</span>
        </button>

        <button
          onClick={() => setShowComments((v) => !v)}
          className="flex items-center gap-1.5 rounded-pill px-3 py-1.5 text-sm text-ink-soft transition-colors hover:bg-surface-sunk"
        >
          <MessageSquare className="h-4 w-4" strokeWidth={1.9} />
          <span className="tabular">{comments.length}</span>
        </button>
      </footer>

      {showComments ? (
        <div className="mt-3 space-y-3 border-t border-line-soft pt-3">
          {comments.map((c) => (
            <div key={c._id} className="flex gap-2.5">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-surface-sunk text-[0.625rem] font-semibold text-ink-soft">
                {(c.commenterId?.fullName ?? "?").slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 rounded-tile bg-surface-sunk px-3 py-2">
                <p className="flex items-center gap-1 text-xs font-medium">
                  {c.commenterId?.fullName ?? "Unknown"}
                  {c.commenterRole === "expert" ? (
                    <BadgeCheck className="h-3 w-3 text-canopy" />
                  ) : null}
                </p>
                <p className="mt-0.5 text-sm text-ink-soft">{c.commentText}</p>
              </div>
            </div>
          ))}

          <form onSubmit={comment} className="flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Add a comment…"
              className="flex-1 rounded-pill border border-line bg-surface px-4 py-2 text-sm placeholder:text-ink-faint focus:border-canopy focus:outline-none focus:ring-2 focus:ring-canopy/15"
            />
            <button
              type="submit"
              disabled={busy || !draft.trim()}
              aria-label="Post comment"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canopy text-ink-invert transition-opacity disabled:opacity-40"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}
