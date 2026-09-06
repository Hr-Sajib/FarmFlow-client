"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, Search } from "lucide-react";

import { API_BASE } from "@/lib/config";
import type { AdvisorySession } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";
import { TimeAgo } from "@/components/ui/TimeAgo";

/**
 * The conversation list, with search applied at the API.
 *
 * The list is rendered here rather than passed in as a render prop: a function
 * cannot cross the server/client boundary — it is not serialisable — so a
 * client component that searches has to own what it draws.
 *
 * The server matches message bodies as well as titles, which is what makes it
 * useful: people remember what was said in a thread far more often than they
 * remember how they titled it.
 */
export function SessionList({ initial }: { initial: AdvisorySession[] }) {
  const [term, setTerm] = useState("");
  const [sessions, setSessions] = useState(initial);
  const [busy, setBusy] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    const id = ++requestId.current;

    if (!term.trim()) {
      setSessions(initial);
      setBusy(false);
      return;
    }

    setBusy(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(
          `${API_BASE}/advisory/my-sessions?searchTerm=${encodeURIComponent(term.trim())}`,
          { credentials: "include" }
        );
        const body = await res.json();
        // Dropped if a newer keystroke has already started its own request.
        if (id !== requestId.current) return;
        if (res.ok) setSessions((body.data as AdvisorySession[]) ?? []);
      } catch {
        /* the previous results stay on screen */
      } finally {
        if (id === requestId.current) setBusy(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [term, initial]);

  return (
    <>
      <div className="relative mb-5">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" />
        <input
          value={term}
          onChange={(e) => setTerm(e.target.value)}
          placeholder="Search your conversations…"
          className="w-full rounded-pill border border-line bg-surface py-3 pl-11 pr-11 text-sm placeholder:text-ink-faint focus:border-canopy focus:outline-none focus:ring-2 focus:ring-canopy/15"
        />
        {busy ? (
          <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-ink-faint" />
        ) : null}
      </div>

      {sessions.length === 0 ? (
        <p className="rounded-card border border-dashed border-line bg-surface/60 px-6 py-10 text-center text-sm text-ink-soft">
          No conversation mentions that.
        </p>
      ) : (
        <ul className="space-y-3">
          {sessions.map((session) => {
            const last = session.chatHistory.at(-1);
            return (
              <li key={session._id}>
                <Link
                  href={`/advisory/${session._id}`}
                  className="block rounded-card bg-surface p-5 card-shadow transition-transform duration-200 hover:-translate-y-0.5"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h3 className="min-w-0 flex-1 font-display text-base font-semibold tracking-tight">
                      {session.problemStatement}
                    </h3>
                    <StatusBadge status={session.status} />
                  </div>

                  {last ? (
                    <p className="mt-2 line-clamp-2 text-sm text-ink-soft">
                      <span className="font-medium capitalize text-ink-faint">
                        {last.senderRole === "ai" ? "Advisor" : last.senderRole}:
                      </span>{" "}
                      {last.messageType === "snapshot"
                        ? "shared a field snapshot"
                        : last.messageContent}
                    </p>
                  ) : (
                    <p className="mt-2 text-sm text-ink-faint">No replies yet</p>
                  )}

                  <p className="mt-3 flex items-center gap-3 text-xs text-ink-faint">
                    <TimeAgo value={session.createdAt} />
                    <span>· {session.chatHistory.length} messages</span>
                    {session.attachedMediaUrls.length ? (
                      <span>· {session.attachedMediaUrls.length} attachments</span>
                    ) : null}
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
