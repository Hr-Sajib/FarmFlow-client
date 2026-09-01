import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Users2 } from "lucide-react";

import { serverFetch } from "@/lib/api";
import type { User } from "@/lib/types";
import { UserRow } from "@/components/admin/UserRow";
import { RoleFilter } from "@/components/admin/RoleFilter";
import { Unavailable } from "@/components/ui/Unavailable";

export const metadata: Metadata = { title: "People" };

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const me = await serverFetch<User>("/user/me");
  // Enforced on the server: a farmer never receives this markup at all.
  if (me?.role !== "admin") redirect("/overview");

  const { role } = await searchParams;
  // null means the request failed; [] means no account matches the filter.
  const users = await serverFetch<User[]>(`/user${role ? `?role=${role}` : ""}`);

  const pendingExperts = (users ?? []).filter(
    (u) => u.role === "expert" && u.expertStatus === "pending"
  ).length;

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">
          People
        </h1>
        {/* No count when the load failed — "0 accounts" would be a claim, not
            a fact. */}
        {users ? (
          <p className="mt-1 text-sm text-ink-soft">
            {users.length} account{users.length === 1 ? "" : "s"}
            {pendingExperts
              ? ` · ${pendingExperts} expert${pendingExperts === 1 ? "" : "s"} awaiting verification`
              : ""}
          </p>
        ) : null}
      </header>

      <RoleFilter current={role ?? ""} />

      {users === null ? (
        <Unavailable what="the account list" />
      ) : users.length === 0 ? (
        <div className="mt-6 rounded-card border border-dashed border-line bg-surface/60 px-8 py-14 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
            <Users2 className="h-5 w-5" strokeWidth={1.85} />
          </span>
          <p className="text-sm text-ink-soft">No accounts match this filter.</p>
        </div>
      ) : (
        <ul className="mt-5 space-y-3">
          {users.map((user) => (
            <UserRow key={user._id} user={user} />
          ))}
        </ul>
      )}
    </div>
  );
}
