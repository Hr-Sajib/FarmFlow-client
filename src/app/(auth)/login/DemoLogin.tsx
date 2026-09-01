"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sprout, Stethoscope, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

import { demoLogin } from "@/lib/session";

/**
 * One-click entry to each role, for anyone evaluating the project.
 *
 * Only the role name leaves the browser; the server decides which account that
 * resolves to. That keeps demo credentials out of the bundle and means these
 * buttons cannot be repointed at a real account by editing the request.
 */
const ROLES = [
  {
    role: "farmer" as const,
    label: "Farmer",
    icon: Sprout,
    blurb: "Live fields, charts and the advisor",
  },
  {
    role: "expert" as const,
    label: "Expert",
    icon: Stethoscope,
    blurb: "The escalation queue",
  },
  {
    role: "admin" as const,
    label: "Admin",
    icon: ShieldCheck,
    blurb: "Accounts and expert verification",
  },
];

export function DemoLogin() {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  const enter = async (role: "farmer" | "expert" | "admin") => {
    setPending(role);
    try {
      await demoLogin(role);
      // Refresh so server components re-render with the new session cookie.
      router.refresh();
      router.push("/dashboard");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not open the demo account"
      );
      setPending(null);
    }
  };

  return (
    <section className="mt-8">
      <div className="flex items-center gap-3">
        <span className="h-px flex-1 bg-line" />
        <span className="text-[0.6875rem] font-medium uppercase tracking-[0.14em] text-ink-faint">
          Or look around first
        </span>
        <span className="h-px flex-1 bg-line" />
      </div>

      <p className="mt-4 text-sm text-ink-soft">
        Open a shared demo account — no sign-up, no password. Each role sees a
        different part of the product.
      </p>

      <div className="mt-4 space-y-2">
        {ROLES.map(({ role, label, icon: Icon, blurb }) => (
          <button
            key={role}
            type="button"
            onClick={() => enter(role)}
            disabled={pending !== null}
            className="flex w-full items-center gap-3 rounded-tile border border-line bg-surface px-4 py-3 text-left transition-colors duration-200 hover:border-canopy hover:bg-canopy-tint/40 disabled:opacity-50"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
              {pending === role ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Icon className="h-4 w-4" strokeWidth={1.85} />
              )}
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-medium">
                {pending === role ? `Opening ${label} demo…` : `${label} demo`}
              </span>
              <span className="block truncate text-xs text-ink-faint">{blurb}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
}
