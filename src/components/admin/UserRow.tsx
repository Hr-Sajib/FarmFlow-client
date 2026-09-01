"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BadgeCheck, Ban, Loader2, ShieldCheck, Undo2, X } from "lucide-react";
import { toast } from "sonner";

import { apiCall } from "@/lib/session";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import type { User } from "@/lib/types";

export function UserRow({ user }: { user: User }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [open, setOpen] = useState(false);

  const patch = async (body: Record<string, unknown>, done: string) => {
    setBusy(true);
    try {
      await apiCall(`/user/${user._id}`, "PATCH", body);
      toast.success(done);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update");
    } finally {
      setBusy(false);
    }
  };

  const pendingDocs = (user.designations ?? []).filter((d) => !d.isApproved);

  return (
    <li className="rounded-card bg-surface p-4 card-shadow">
      <div className="flex flex-wrap items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-canopy-tint text-xs font-semibold text-canopy">
          {user.fullName.slice(0, 2).toUpperCase()}
        </span>

        <div className="min-w-0 flex-1">
          <p className="flex items-center gap-1.5 truncate text-sm font-medium">
            {user.fullName}
            {user.expertStatus === "verified" ? (
              <BadgeCheck className="h-4 w-4 text-canopy" aria-label="Verified" />
            ) : null}
          </p>
          <p className="truncate text-xs text-ink-faint">
            {user.email} · <span className="tabular">{user.userCode}</span>
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <Badge tone="neutral" className="capitalize">{user.role}</Badge>
          {user.status === "blocked" ? <Badge tone="alert">Blocked</Badge> : null}
          {user.role === "expert" && user.expertStatus ? (
            <Badge tone={user.expertStatus === "verified" ? "canopy" : user.expertStatus === "rejected" ? "alert" : "warn"}>
              {user.expertStatus}
            </Badge>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5">
          {user.role === "expert" ? (
            <Button size="sm" variant="ghost" onClick={() => setOpen((v) => !v)}>
              {open ? "Hide" : `Credentials${pendingDocs.length ? ` (${pendingDocs.length})` : ""}`}
            </Button>
          ) : null}

          {/* Admins are peers: one cannot lock another out. The server refuses
              it as well, so hiding the control is the affordance, not the rule. */}
          {user.role !== "admin" ? (
            <Button
              size="sm"
              variant={user.status === "blocked" ? "outline" : "ghost"}
              disabled={busy}
              onClick={() =>
                patch(
                  { status: user.status === "blocked" ? "active" : "blocked" },
                  user.status === "blocked" ? "Account unblocked" : "Account blocked"
                )
              }
            >
              {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : user.status === "blocked" ? <Undo2 className="h-3.5 w-3.5" /> : <Ban className="h-3.5 w-3.5" />}
              {user.status === "blocked" ? "Unblock" : "Block"}
            </Button>
          ) : null}
        </div>
      </div>

      {open && user.role === "expert" ? (
        <div className="mt-3 space-y-2 border-t border-line-soft pt-3">
          {(user.designations ?? []).length === 0 ? (
            <p className="text-sm text-ink-faint">
              No credentials submitted. They can add them from their profile.
            </p>
          ) : (
            (user.designations ?? []).map((d, i) => (
              <div key={d._id ?? i} className="rounded-tile bg-surface-sunk px-4 py-3">
                <p className="text-sm font-medium">{d.designationTitle}</p>
                <p className="text-xs text-ink-soft">{d.designatedFrom}</p>
                {d.documents?.length ? (
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {d.documents.map((doc, n) => (
                      <li key={doc}>
                        <a
                          href={doc}
                          target="_blank"
                          rel="noreferrer"
                          className="text-xs text-canopy underline underline-offset-2"
                        >
                          Document {n + 1}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-1 text-xs text-ink-faint">No documents attached</p>
                )}
              </div>
            ))
          )}

          <div className="flex gap-2 pt-1">
            <Button
              size="sm"
              disabled={busy || user.expertStatus === "verified"}
              onClick={() =>
                patch({ expertStatus: "verified" }, `${user.fullName} is now a verified expert`)
              }
            >
              <ShieldCheck className="h-3.5 w-3.5" />
              Verify
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={busy || user.expertStatus === "rejected"}
              onClick={() => patch({ expertStatus: "rejected" }, "Verification declined")}
            >
              <X className="h-3.5 w-3.5" />
              Decline
            </Button>
          </div>
        </div>
      ) : null}
    </li>
  );
}
