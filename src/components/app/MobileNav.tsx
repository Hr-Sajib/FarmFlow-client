"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, MessagesSquare, Users2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const ITEMS = [
  { href: "/dashboard", label: "Home", icon: LayoutGrid },
  { href: "/advisory", label: "Advisory", icon: MessagesSquare },
  { href: "/forum", label: "Community", icon: Users2 },
  { href: "/profile", label: "Profile", icon: UserRound },
];

/** Bottom bar on small screens, where a fixed sidebar would eat the viewport. */
export function MobileNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur lg:hidden">
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
                  active ? "text-canopy" : "text-ink-faint"
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
