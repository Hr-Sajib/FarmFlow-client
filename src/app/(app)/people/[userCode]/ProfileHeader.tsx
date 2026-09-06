"use client";

import { useState } from "react";

import type { PublicProfile } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { FollowButton } from "./FollowButton";

const EXPERT_LABEL = {
  verified: "Verified expert",
  pending: "Verification pending",
  rejected: "Verification declined",
} as const;

/** Client-side only so the follower count can move with the button. */
export function ProfileHeader({ profile }: { profile: PublicProfile }) {
  const { person, follow, isSelf } = profile;
  const [followers, setFollowers] = useState(follow.followers);

  return (
    <header className="rounded-card bg-surface p-6 card-shadow">
      <div className="flex flex-wrap items-start gap-4">
        <Avatar name={person.fullName} photo={person.photo} size={72} />

        <div className="min-w-0 flex-1">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {person.fullName}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
            <span className="capitalize">{person.role}</span>
            {person.address ? <span>· {person.address}</span> : null}
            {person.role === "expert" && person.expertStatus ? (
              <Badge
                tone={
                  person.expertStatus === "verified"
                    ? "canopy"
                    : person.expertStatus === "rejected"
                      ? "alert"
                      : "warn"
                }
              >
                {EXPERT_LABEL[person.expertStatus]}
              </Badge>
            ) : null}
          </p>

          <dl className="mt-3 flex gap-5 text-sm">
            <div className="flex items-baseline gap-1.5">
              <dt className="tabular font-semibold">{followers}</dt>
              <dd className="text-ink-faint">followers</dd>
            </div>
            <div className="flex items-baseline gap-1.5">
              <dt className="tabular font-semibold">{follow.following}</dt>
              <dd className="text-ink-faint">following</dd>
            </div>
          </dl>
        </div>

        {/* Following yourself is not a state worth having, so the control is
            simply absent rather than shown disabled. */}
        {!isSelf ? (
          <FollowButton
            userCode={person.userCode}
            initiallyFollowing={follow.isFollowing}
            onCountChange={(delta) => setFollowers((n) => n + delta)}
          />
        ) : null}
      </div>

      {person.designations?.length ? (
        <ul className="mt-5 space-y-2 border-t border-line-soft pt-4">
          {person.designations.map((d) => (
            <li key={`${d.designationTitle}-${d.designatedFrom}`} className="text-sm">
              <span className="font-medium">{d.designationTitle}</span>
              <span className="text-ink-soft"> · {d.designatedFrom}</span>
              {d.isApproved ? (
                <Badge tone="canopy" className="ml-2">Approved</Badge>
              ) : null}
            </li>
          ))}
        </ul>
      ) : null}
    </header>
  );
}
