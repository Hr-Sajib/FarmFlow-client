import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";

import { serverFetch } from "@/lib/api";
import type { AdvisorySession, User } from "@/lib/types";
import { StatusBadge } from "@/components/advisory/StatusBadge";
import { ChatWindow } from "@/components/advisory/ChatWindow";
import { EscalateButton } from "@/components/advisory/EscalateButton";
import { SessionActions } from "@/components/advisory/SessionActions";

export const metadata: Metadata = { title: "Conversation" };

/**
 * The session, including its transcript, is fetched on the server. The socket
 * then keeps it current — it does not have to load the history first.
 */
export default async function AdvisorySessionPage({
  params,
}: {
  params: Promise<{ sessionId: string }>;
}) {
  const { sessionId } = await params;

  const [user, sessions] = await Promise.all([
    serverFetch<User>("/user/me"),
    serverFetch<AdvisorySession[]>("/advisory/my-sessions"),
  ]);

  const session = sessions?.find((s) => s._id === sessionId);
  if (!user || !session) notFound();

  const canEscalate =
    user.role === "farmer" &&
    session.farmerId === user.userCode &&
    (session.status === "ai_active" || session.status === "awaiting_expert");

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <Link
        href="/advisory"
        className="mb-5 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Advisory
      </Link>

      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="mb-2">
            <StatusBadge status={session.status} />
          </div>
          <h1 className="font-display text-xl font-semibold tracking-tight lg:text-2xl">
            {session.problemStatement}
          </h1>
          {session.problemDetails ? (
            <p className="mt-1.5 max-w-2xl text-sm text-ink-soft">
              {session.problemDetails}
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {canEscalate ? <EscalateButton sessionId={session._id} /> : null}
          <SessionActions session={session} user={user} />
        </div>
      </div>

      <ChatWindow session={session} user={user} />
    </div>
  );
}
