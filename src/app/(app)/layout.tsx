import { redirect } from "next/navigation";

import { serverFetch } from "@/lib/api";
import type { User } from "@/lib/types";
import { Sidebar } from "@/components/app/Sidebar";
import { MobileNav } from "@/components/app/MobileNav";

/**
 * Server component. The signed-in user is resolved here once and passed down,
 * so no page repeats the request and nothing renders before the session is
 * known — there is no authenticated flash of content.
 */
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await serverFetch<User>("/user/me");
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar user={user} />
      <main className="min-w-0 flex-1 pb-20 lg:pb-0">{children}</main>
      <MobileNav />
    </div>
  );
}
