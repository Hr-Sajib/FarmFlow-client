import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Users2 } from "lucide-react";

import { serverFetch } from "@/lib/api";
import type { PublicProfile, User } from "@/lib/types";
import { PostCard } from "@/components/forum/PostCard";
import { ProfileHeader } from "./ProfileHeader";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ userCode: string }>;
}): Promise<Metadata> {
  const { userCode } = await params;
  const profile = await serverFetch<PublicProfile>(`/people/${userCode}/profile`);
  return { title: profile?.person.fullName ?? "Profile" };
}

/**
 * Someone's public page: who they are and what they have posted.
 *
 * The server decides what is public — this renders whatever it returns rather
 * than fetching a user and choosing here, so the rule about which fields are
 * shareable lives in one place instead of being restated per screen.
 */
export default async function PersonPage({
  params,
}: {
  params: Promise<{ userCode: string }>;
}) {
  const { userCode } = await params;

  const [profile, me] = await Promise.all([
    serverFetch<PublicProfile>(`/people/${userCode}/profile`),
    serverFetch<User>("/user/me"),
  ]);

  if (!profile || !me) notFound();

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 lg:py-10">
      <ProfileHeader profile={profile} />

      <h2 className="mb-4 mt-8 font-display text-lg font-semibold tracking-tight">
        {profile.isSelf ? "Your posts" : "Posts"}
      </h2>

      {profile.posts.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface/60 px-8 py-12 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
            <Users2 className="h-5 w-5" strokeWidth={1.85} />
          </span>
          <p className="text-sm text-ink-soft">
            {profile.isSelf
              ? "You haven't posted yet."
              : "Nothing posted publicly yet."}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {profile.posts.map((post) => (
            <PostCard key={post._id} post={post} user={me} />
          ))}
        </div>
      )}
    </div>
  );
}
