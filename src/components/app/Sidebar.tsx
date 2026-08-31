"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  MessagesSquare,
  Users2,
  UserRound,
  Sprout,
  LogOut,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { logout } from "@/lib/session";
import { useRouter } from "next/navigation";

/**
 * Navigation is derived from the signed-in role: a farmer never sees an admin
 * link they cannot use, and an expert's entry point is their advisory queue
 * rather than a field grid they do not own.
 */
function navFor(role: User["role"]) {
  const common = [
    { href: "/advisory", label: "Advisory", icon: MessagesSquare },
    { href: "/forum", label: "Community", icon: Users2 },
    { href: "/profile", label: "Profile", icon: UserRound },
  ];

  if (role === "admin") {
    return [
      { href: "/dashboard", label: "Overview", icon: LayoutGrid },
      { href: "/fields", label: "All fields", icon: Sprout },
      { href: "/users", label: "People", icon: Users2 },
      ...common.filter((i) => i.href !== "/forum"),
      { href: "/forum", label: "Community", icon: Users2 },
    ];
  }

  return [{ href: "/dashboard", label: "Dashboard", icon: LayoutGrid }, ...common];
}

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const items = navFor(user.role);

  const signOut = async () => {
    await logout();
    router.refresh();
    router.push("/login");
  };

  return (
    <aside className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col border-r border-line bg-surface px-4 py-6 lg:flex">
      <Link href="/dashboard" className="px-3 font-display text-lg font-semibold tracking-tight">
        Farm<span className="text-canopy">Flow</span>
      </Link>

      <nav className="mt-8 flex-1 space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-pill px-3 py-2.5 text-sm transition-colors duration-200",
                active
                  ? "bg-canopy text-ink-invert"
                  : "text-ink-soft hover:bg-surface-sunk hover:text-ink"
              )}
            >
              <Icon className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.85} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="space-y-1 border-t border-line pt-4">
        <div className="flex items-center gap-3 px-3 py-2">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-canopy-tint text-xs font-semibold text-canopy">
            {user.fullName.slice(0, 2).toUpperCase()}
          </span>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{user.fullName}</p>
            <p className="truncate text-xs capitalize text-ink-faint">{user.role}</p>
          </div>
        </div>
        <button
          onClick={signOut}
          className="flex w-full items-center gap-3 rounded-pill px-3 py-2.5 text-sm text-ink-soft transition-colors hover:bg-surface-sunk hover:text-ink"
        >
          <LogOut className="h-[1.05rem] w-[1.05rem]" strokeWidth={1.85} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
