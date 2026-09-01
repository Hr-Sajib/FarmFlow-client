"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, MessagesSquare, Users2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/overview", label: "Overview", icon: LayoutGrid },
  { href: "/advisory", label: "Advisory", icon: MessagesSquare },
  { href: "/forum", label: "Community", icon: Users2 },
  { href: "/profile", label: "Profile", icon: UserRound },
];

/**
 * Bottom bar on small screens, where a fixed sidebar would eat the viewport.
 *
 * Floats clear of the window like the sidebar card rather than sitting flush on
 * the edge. The bottom offset takes the larger of the gutter and the safe-area
 * inset, so on a phone with a home indicator the bar clears it instead of
 * tucking underneath.
 */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] z-40 overflow-hidden rounded-xl border border-canopy-deep bg-canopy/95 backdrop-blur card-shadow lg:hidden">
      <ul className="grid grid-cols-4">
        {ITEMS.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 py-2.5 text-[0.6875rem] transition-colors",
                  // Signal marks the current tab; the rest sit in inverted ink
                  // at 80%, which is where these 11px labels clear 4.5:1
                  // against the green. 70% measured 4.24:1 and failed.
                  active ? "text-shoot" : "text-ink-invert/80"
                )}
              >
                <Icon className="h-5 w-5" strokeWidth={1.85} />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
