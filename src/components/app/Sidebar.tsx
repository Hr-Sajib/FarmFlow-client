"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  LayoutGrid,
  MessagesSquare,
  Users2,
  UserRound,
  Sprout,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { User } from "@/lib/types";
import { logout } from "@/lib/session";

/**
 * A rail that stays out of the way and widens when it is being used.
 *
 * Two states, one mechanism: pointing at the rail expands it over the page,
 * and pinning it makes the expansion permanent so the content reflows beside
 * it instead of underneath. Hover expansion deliberately overlays rather than
 * pushing — a layout that reflows every time the pointer crosses the edge of
 * the screen is worse than no expansion at all.
 */
const RAIL = "4.5rem"; // 72px — icons only
const PANEL = "15.75rem"; // 252px — icons with labels
const PIN_KEY = "farmflow:sidebar-pinned";

type NavItem = { href: string; label: string; icon: typeof LayoutGrid };
type NavGroup = { heading: string; items: NavItem[] };

/**
 * Navigation is derived from the signed-in role: a farmer never sees an admin
 * link they cannot use, and an expert's entry point is their advisory queue
 * rather than a field grid they do not own.
 */
function navFor(role: User["role"]): NavGroup[] {
  const workspace: NavItem[] =
    role === "admin"
      ? [
          { href: "/dashboard", label: "Overview", icon: LayoutGrid },
          { href: "/fields", label: "All fields", icon: Sprout },
          { href: "/advisory", label: "Advisory", icon: MessagesSquare },
          { href: "/forum", label: "Community", icon: Users2 },
        ]
      : [
          { href: "/dashboard", label: "Dashboard", icon: LayoutGrid },
          { href: "/advisory", label: "Advisory", icon: MessagesSquare },
          { href: "/forum", label: "Community", icon: Users2 },
        ];

  const account: NavItem[] =
    role === "admin"
      ? [
          { href: "/users", label: "People", icon: Users2 },
          { href: "/profile", label: "Profile", icon: UserRound },
        ]
      : [{ href: "/profile", label: "Profile", icon: UserRound }];

  return [
    { heading: "Workspace", items: workspace },
    { heading: "Account", items: account },
  ];
}

export function Sidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const groups = navFor(user.role);

  const [pinned, setPinned] = useState(false);
  const [hovered, setHovered] = useState(false);
  const open = pinned || hovered;

  // Read after mount rather than during render: the server has no localStorage,
  // and seeding state from it directly would hydrate to a different width.
  useEffect(() => {
    setPinned(window.localStorage.getItem(PIN_KEY) === "true");
  }, []);

  const togglePinned = () => {
    setPinned((prev) => {
      window.localStorage.setItem(PIN_KEY, String(!prev));
      return !prev;
    });
  };

  const signOut = async () => {
    await logout();
    router.refresh();
    router.push("/login");
  };

  // Labels are present in the DOM at every width so the accessible name of each
  // link never depends on the pointer being in the right place; only their
  // opacity and offset animate.
  const label = (text: string) => (
    <span
      className={cn(
        "min-w-0 truncate transition-all duration-200 ease-out",
        open ? "translate-x-0 opacity-100 delay-75" : "-translate-x-1 opacity-0"
      )}
    >
      {text}
    </span>
  );

  return (
    <aside
      // Only the pinned width reserves layout space. Hover expansion floats.
      style={{ width: pinned ? PANEL : RAIL }}
      // z-30 is load-bearing, not decoration. The expanded panel overflows the
      // rail and floats over the page; positioned content inside <main> comes
      // later in the DOM, so without an explicit layer it wins the stacking
      // order and swallows pointer events over the panel — the sidebar would
      // collapse as soon as the cursor reached a label.
      className="sticky top-0 z-30 hidden h-screen shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block"
    >
      <div
        style={{ width: open ? PANEL : RAIL }}
        // These belong on the panel, not on the <aside>. Unpinned, the aside
        // stays at rail width while the panel overflows it — so handlers on the
        // aside would fire mouseleave the moment the pointer reached a label,
        // collapsing the sidebar out from under the click.
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        // Keyboard users get the same reveal: tabbing into the rail expands it.
        onFocusCapture={() => setHovered(true)}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node)) {
            setHovered(false);
          }
        }}
        className={cn(
          "absolute inset-y-0 left-0 flex flex-col overflow-hidden border-r border-line bg-surface py-5",
          "transition-[width,box-shadow] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
          hovered && !pinned && "card-shadow-lg"
        )}
      >
        {/* ---------- brand + pin ----------
            The toggle is always visible and always clickable. Hover expansion
            is an enhancement on top of it, not the only way in: a touch device
            has no hover at all, and a control that can only be reached by
            hovering cannot be reached by keyboard either. */}
        <div className="flex items-center px-3">
          <Link
            href="/dashboard"
            aria-label="FarmFlow home"
            className={cn(
              "flex min-w-0 items-center gap-3 overflow-hidden rounded-tile py-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              open ? "flex-1 px-[0.9375rem] opacity-100" : "w-0 px-0 opacity-0"
            )}
          >
            <Sprout
              className="h-[1.125rem] w-[1.125rem] shrink-0 text-canopy"
              strokeWidth={2}
            />
            <span className="truncate font-display text-base font-semibold tracking-tight">
              Farm<span className="text-canopy">Flow</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={togglePinned}
            aria-expanded={pinned}
            aria-label={pinned ? "Collapse sidebar" : "Keep sidebar open"}
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-tile text-ink-faint transition-colors duration-200 hover:bg-surface-sunk hover:text-ink",
              open ? "ml-0" : "mx-auto"
            )}
          >
            {pinned ? (
              <PanelLeftClose className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.85} />
            ) : (
              <PanelLeftOpen className="h-[1.125rem] w-[1.125rem]" strokeWidth={1.85} />
            )}
          </button>
        </div>

        {/* ---------- navigation ---------- */}
        <nav className="mt-5 flex-1 overflow-y-auto overflow-x-hidden px-3">
          {groups.map((group, i) => (
            <div key={group.heading} className={cn(i > 0 && "mt-5 border-t border-line pt-5")}>
              {/* The heading carries the grouping when there is room for it;
                  the divider above already carries it when there is not. */}
              <p
                className={cn(
                  "h-4 px-[0.9375rem] text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ink-faint transition-all duration-200 ease-out",
                  open
                    ? "translate-x-0 opacity-100 delay-75"
                    : "-translate-x-1 opacity-0"
                )}
              >
                {group.heading}
              </p>

              <ul className="mt-1.5 space-y-1">
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "flex items-center gap-3 whitespace-nowrap rounded-tile px-[0.9375rem] py-2.5 text-sm transition-colors duration-200",
                          active
                            ? "bg-canopy text-ink-invert"
                            : "text-ink-soft hover:bg-surface-sunk hover:text-ink"
                        )}
                      >
                        <Icon
                          className="h-[1.125rem] w-[1.125rem] shrink-0"
                          strokeWidth={1.85}
                        />
                        {label(item.label)}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>

        {/* ---------- account ---------- */}
        <div className="mt-4 border-t border-line px-3 pt-4">
          <div className="flex items-center gap-3 whitespace-nowrap rounded-tile px-[0.9375rem] py-2">
            <span className="flex h-[1.875rem] w-[1.875rem] shrink-0 items-center justify-center rounded-full bg-canopy-tint text-[0.6875rem] font-semibold text-canopy">
              {user.fullName.slice(0, 2).toUpperCase()}
            </span>
            <span
              className={cn(
                "min-w-0 transition-all duration-200 ease-out",
                open
                  ? "translate-x-0 opacity-100 delay-75"
                  : "-translate-x-1 opacity-0"
              )}
            >
              <span className="block truncate text-sm font-medium">
                {user.fullName}
              </span>
              <span className="block truncate text-xs capitalize text-ink-faint">
                {user.role}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={signOut}
            className="mt-1 flex w-full items-center gap-3 whitespace-nowrap rounded-tile px-[0.9375rem] py-2.5 text-sm text-ink-soft transition-colors duration-200 hover:bg-surface-sunk hover:text-ink"
          >
            <LogOut className="h-[1.125rem] w-[1.125rem] shrink-0" strokeWidth={1.85} />
            {label("Sign out")}
          </button>
        </div>
      </div>
    </aside>
  );
}
