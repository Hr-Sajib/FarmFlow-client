"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Search, Users2 } from "lucide-react";

import { API_BASE } from "@/lib/config";
import type { Post, PostPage, User } from "@/lib/types";
import { PostCard } from "./PostCard";
import { TopicFilter } from "./TopicFilter";
import { Unavailable } from "@/components/ui/Unavailable";

const DEBOUNCE_MS = 300;

/**
 * The feed: one page at a time, with search and tag filtering applied at the
 * API rather than to what happens to be loaded.
 *
 * Filtering the loaded array would only ever search the first page, so a
 * farmer looking for something they posted last month would be told it does
 * not exist. Every change of term or tag starts a fresh query from the server.
 */
export function PostFeed({
  initial,
  user,
}: {
  initial: PostPage | null;
  user: User;
}) {
  const [posts, setPosts] = useState<Post[]>(initial?.posts ?? []);
  const [cursor, setCursor] = useState<string | null>(initial?.nextCursor ?? null);
  const [hasMore, setHasMore] = useState(initial?.hasMore ?? false);
  const [failed, setFailed] = useState(initial === null);

  const [term, setTerm] = useState("");
  const [topics, setTopics] = useState<string[]>([]);
  const [searching, setSearching] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const sentinel = useRef<HTMLDivElement>(null);
  // Guards against a stale response overwriting a newer one: typing quickly
  // starts several requests and they do not necessarily come back in order.
  const requestId = useRef(0);

  const query = useCallback(
    (next?: string) => {
      const params = new URLSearchParams();
      if (term.trim()) params.set("searchTerm", term.trim());
      if (topics.length) params.set("topics", topics.join(","));
      if (next) params.set("cursor", next);
      return `${API_BASE}/post?${params.toString()}`;
    },
    [term, topics]
  );

  // Fresh query whenever the term or the tags change.
  useEffect(() => {
    const id = ++requestId.current;
    setSearching(true);

    const timer = setTimeout(async () => {
      try {
        const res = await fetch(query(), { credentials: "include" });
        const body = await res.json();
        if (id !== requestId.current) return;

        if (!res.ok) {
          setFailed(true);
        } else {
          const page = body.data as PostPage;
          setFailed(false);
          setPosts(page.posts);
          setCursor(page.nextCursor);
          setHasMore(page.hasMore);
        }
      } catch {
        if (id === requestId.current) setFailed(true);
      } finally {
        if (id === requestId.current) setSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => clearTimeout(timer);
  }, [query]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loadingMore || searching || !cursor) return;
    setLoadingMore(true);
    try {
      const res = await fetch(query(cursor), { credentials: "include" });
      const body = await res.json();
      if (res.ok) {
        const page = body.data as PostPage;
        // Appended by id rather than blindly: a post created while reading
        // would otherwise arrive in both pages.
        setPosts((prev) => {
          const seen = new Set(prev.map((p) => p._id));
          return [...prev, ...page.posts.filter((p) => !seen.has(p._id))];
        });
        setCursor(page.nextCursor);
        setHasMore(page.hasMore);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, hasMore, loadingMore, searching, query]);

  // Fetches the next page as the end of the list comes into view, with enough
  // margin that the reader does not meet the bottom before it arrives.
  useEffect(() => {
    const node = sentinel.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) void loadMore();
      },
      { rootMargin: "600px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <>
      <div className="mt-5 space-y-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
          <input
            value={term}
            onChange={(e) => setTerm(e.target.value)}
            placeholder="Search posts and topics…"
            className="w-full rounded-pill border border-line bg-surface py-3 pl-11 pr-11 text-sm placeholder:text-ink-faint focus:border-canopy focus:outline-none focus:ring-2 focus:ring-canopy/15"
          />
          {searching ? (
            <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-faint" />
          ) : null}
        </div>

        <TopicFilter selected={topics} onChange={setTopics} />
      </div>

      {failed ? (
        <div className="mt-6">
          <Unavailable what="the forum" />
        </div>
      ) : posts.length === 0 && !searching ? (
        <div className="mt-6 rounded-card border border-dashed border-line bg-surface/60 px-8 py-14 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
            <Users2 className="h-5 w-5" strokeWidth={1.85} />
          </span>
          <h2 className="font-display text-lg font-semibold">
            {term || topics.length ? "Nothing matches that" : "Nothing here yet"}
          </h2>
          <p className="mx-auto mt-1.5 max-w-xs text-sm text-ink-soft">
            {term || topics.length
              ? "Try a different word, or clear the topic filter."
              : "Be the first to post. A question about a crop you're growing is a good place to start."}
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-4">
          {posts.map((post) => (
            <PostCard
              key={post._id}
              post={post}
              user={user}
              onRemoved={(id) =>
                setPosts((prev) => prev.filter((p) => p._id !== id))
              }
            />
          ))}
        </div>
      )}

      <div ref={sentinel} aria-hidden className="h-px" />

      {loadingMore ? (
        <p className="flex items-center justify-center gap-2 py-6 text-sm text-ink-faint">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading more…
        </p>
      ) : !hasMore && posts.length > 0 ? (
        <p className="py-6 text-center text-xs text-ink-faint">
          That&rsquo;s everything.
        </p>
      ) : null}
    </>
  );
}
