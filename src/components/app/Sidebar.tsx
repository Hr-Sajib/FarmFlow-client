"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
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
import { Avatar } from "@/components/ui/Avatar";
import { logout } from "@/lib/session";

/**
 * A rail that stays out of the way and widens when it is being used.
 *
 * Expansion always reserves layout space, whether it came from hovering or
 * from pinning, so the page content narrows beside the sidebar and nothing is
 * ever covered by it. Pinning only decides whether the expansion persists once
 * the pointer leaves.
 */
// The sidebar is a card that floats clear of the window on every side, so the
// track it sits in is the visible width plus a gutter each side.
const GUTTER_PX = 12; // matches the inset-3 on the panel
const RAIL = `${(72 + GUTTER_PX * 2) / 16}rem`; // 72px of icons
const PANEL = `${(252 + GUTTER_PX * 2) / 16}rem`; // 252px of icons and labels

/**
 * Row padding is 14px, not 15px, and the odd number is load-bearing. The panel
 * draws a 1px border, so its content box starts one pixel in; with 12px of
 * panel padding and a 18px icon, 15px of row padding put every icon's centre at
 * 37px inside a 72px card — one pixel right of centre, which showed up as
 * uneven gaps either side of the round avatar. 14px lands the column on 36.
 */

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
          { href: "/overview", label: "Overview", icon: LayoutGrid },
          { href: "/fields", label: "All fields", icon: Sprout },
          { href: "/advisory", label: "Advisory", icon: MessagesSquare },
          { href: "/forum", label: "Community", icon: Users2 },
        ]
      : [
          { href: "/overview", label: "Overview", icon: LayoutGrid },
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

  // Deliberately not persisted. Remembering the pin meant that expanding it
  // once left it expanded on every later visit, so the rail was wide as often
  // as it was slim and never settled into one resting state. It now starts
  // collapsed every time and widens only while it is being used — pointed at,
  // tabbed into, or held open with the toggle for the rest of the visit.
  const togglePinned = () => setPinned((prev) => !prev);

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
      style={{ width: open ? PANEL : RAIL }}
      // z-30 keeps the card above positioned content in <main>, which comes
      // later in the DOM and would otherwise win the stacking order and swallow
      // pointer events over the panel — collapsing the sidebar mid-click.
      className="sticky top-0 z-30 hidden h-screen shrink-0 transition-[width] duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] lg:block"
    >
      <div
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
        // inset-3 is what lifts the card off all four edges. It is a card
        // rather than a full-height column, so it carries a border and radius
        // all the way round instead of a single divider on its right.
        className="absolute inset-3 flex flex-col overflow-hidden rounded-card border border-line bg-surface py-5 card-shadow"
      >
        {/* ---------- brand + pin ----------
            The toggle is always visible and always clickable. Hover expansion
            is an enhancement on top of it, not the only way in: a touch device
            has no hover at all, and a control that can only be reached by
            hovering cannot be reached by keyboard either. */}
        <div className="flex items-center px-3">
          <Link
            href="/overview"
            aria-label="FarmFlow home"
            className={cn(
              "flex min-w-0 items-center gap-3 overflow-hidden rounded-tile py-2 transition-all duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
              open ? "flex-1 px-[0.875rem] opacity-100" : "w-0 px-0 opacity-0"
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
                  "h-4 px-[0.875rem] text-[0.625rem] font-medium uppercase tracking-[0.14em] text-ink-faint transition-all duration-200 ease-out",
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
                          "flex items-center gap-3 whitespace-nowrap rounded-tile px-[0.875rem] py-2.5 text-sm transition-colors duration-200",
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
          <div className="flex items-center gap-3 whitespace-nowrap rounded-tile px-[0.875rem] py-2">
            {/* The avatar is wider than the icons above it, and every row shares
                the same left padding — so left-aligning it put its centre 6px
                right of the icon column, leaving visibly uneven gaps either
                side of it in the collapsed rail. This box is the icon width, so
                the larger avatar overhangs it evenly and centres on the same
                axis; the label still starts where the nav labels do. */}
            <span className="flex w-[1.125rem] shrink-0 justify-center">
              <Avatar name={user.fullName} photo={user.photo} size={30} />
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
            className="mt-1 flex w-full items-center gap-3 whitespace-nowrap rounded-tile px-[0.875rem] py-2.5 text-sm text-ink-soft transition-colors duration-200 hover:bg-surface-sunk hover:text-ink"
          >
            <LogOut className="h-[1.125rem] w-[1.125rem] shrink-0" strokeWidth={1.85} />
            {label("Sign out")}
          </button>
        </div>
      </div>
    </aside>
  );
}
