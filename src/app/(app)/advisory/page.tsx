import type { Metadata } from "next";
import Link from "next/link";
import { MessagesSquare, Plus } from "lucide-react";

import { serverFetch } from "@/lib/api";
import type { AdvisorySession, User } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { SessionList } from "@/components/advisory/SessionList";
import { Unavailable } from "@/components/ui/Unavailable";

export const metadata: Metadata = { title: "Advisory" };

export default async function AdvisoryPage() {
  const [user, sessions] = await Promise.all([
    serverFetch<User>("/user/me"),
    serverFetch<AdvisorySession[]>("/advisory/my-sessions"),
  ]);

  // null means the request failed; [] means there are no sessions yet.
  const list = sessions;
  const isExpert = user?.role === "expert";

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">
            {isExpert ? "Assigned to you" : "Advisory"}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {isExpert
              ? "Conversations a farmer escalated to a human expert"
              : "Ask about a problem. The advisor answers first; a verified expert can take over."}
          </p>
        </div>

        {!isExpert ? (
          <Button asChild variant="primary">
            <Link href="/advisory/new">
              <Plus className="h-4 w-4" />
              New question
            </Link>
          </Button>
        ) : null}
      </header>

      {list === null ? (
        <Unavailable what="your conversations" />
      ) : list.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface/60 px-8 py-16 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
            <MessagesSquare className="h-5 w-5" strokeWidth={1.85} />
          </span>
          <h2 className="font-display text-lg font-semibold">
            {isExpert ? "Nothing assigned yet" : "No questions yet"}
          </h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-soft">
            {isExpert
              ? "When a farmer asks for a human expert, their conversation appears here with its full history."
              : "Describe what you're seeing — a yellowing leaf, a reading that looks wrong — and attach a photo if you have one."}
          </p>
          {!isExpert ? (
            <Button asChild variant="primary" className="mt-6">
              <Link href="/advisory/new">
                <Plus className="h-4 w-4" />
                Ask your first question
              </Link>
            </Button>
          ) : null}
        </div>
      ) : (
        <SessionList initial={list} />
      )}
    </div>
  );
}
