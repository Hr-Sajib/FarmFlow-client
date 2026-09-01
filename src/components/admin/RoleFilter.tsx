"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

const ROLES = [
  { value: "", label: "Everyone" },
  { value: "farmer", label: "Farmers" },
  { value: "expert", label: "Experts" },
  { value: "admin", label: "Admins" },
];

/** Filters run through the URL so a filtered view can be linked and shared. */
export function RoleFilter({ current }: { current: string }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {ROLES.map((role) => (
        <Link
          key={role.value}
          href={role.value ? `/users?role=${role.value}` : "/users"}
          className={cn(
            "rounded-pill px-3.5 py-1.5 text-xs font-medium transition-colors",
            current === role.value
              ? "bg-canopy text-ink-invert"
              : "bg-surface-sunk text-ink-soft hover:text-ink"
          )}
        >
          {role.label}
        </Link>
      ))}
    </div>
  );
}
