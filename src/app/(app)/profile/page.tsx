import type { Metadata } from "next";
import { BadgeCheck, Clock, ShieldAlert } from "lucide-react";

import { serverFetch } from "@/lib/api";
import type { Field, User } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { ProfileForm } from "./ProfileForm";
import { DesignationPanel } from "./DesignationPanel";

export const metadata: Metadata = { title: "Profile" };

const EXPERT_STATE = {
  verified: { label: "Verified expert", tone: "canopy" as const, icon: BadgeCheck },
  pending: { label: "Verification pending", tone: "warn" as const, icon: Clock },
  rejected: { label: "Verification declined", tone: "alert" as const, icon: ShieldAlert },
};

export default async function ProfilePage() {
  const user = await serverFetch<User>("/user/me");
  if (!user) return null;

  const fields =
    user.role === "farmer" ? (await serverFetch<Field[]>("/field/myFields")) ?? [] : [];

  const expertState = user.expertStatus ? EXPERT_STATE[user.expertStatus] : null;

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 lg:py-10">
      <header className="mb-8 flex items-center gap-4">
        <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-canopy text-lg font-semibold text-ink-invert">
          {user.fullName.slice(0, 2).toUpperCase()}
        </span>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-semibold tracking-tight">
            {user.fullName}
          </h1>
          <p className="mt-1 flex flex-wrap items-center gap-2 text-sm text-ink-soft">
            <span className="capitalize">{user.role}</span>
            <span className="tabular text-ink-faint">· {user.userCode}</span>
            {expertState ? (
              <Badge tone={expertState.tone}>{expertState.label}</Badge>
            ) : null}
          </p>
        </div>
      </header>

      {user.role === "farmer" ? (
        <div className="mb-6 grid grid-cols-2 gap-3">
          <div className="rounded-card bg-surface p-4 card-shadow">
            <p className="text-xs text-ink-faint">Fields</p>
            <p className="tabular mt-1 text-2xl font-semibold">{fields.length}</p>
          </div>
          <div className="rounded-card bg-surface p-4 card-shadow">
            <p className="text-xs text-ink-faint">Member since</p>
            <p className="mt-1 text-sm font-medium">
              {new Date(user.createdAt).toLocaleDateString([], {
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>
      ) : null}

      {user.role === "expert" ? <DesignationPanel user={user} /> : null}

      <ProfileForm user={user} />
    </div>
  );
}
