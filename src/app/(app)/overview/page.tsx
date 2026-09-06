import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { serverFetch } from "@/lib/api";
import type { User } from "@/lib/types";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { ExpertOverview } from "@/components/expert/ExpertOverview";

export const metadata: Metadata = { title: "Overview" };

/**
 * The platform's own summary, which only makes sense for someone who does not
 * own fields. A farmer's overview *is* their fields, so they are sent to the
 * page that shows them rather than given a second, emptier version of it.
 */
export default async function OverviewPage() {
  const user = await serverFetch<User>("/user/me");

  if (user?.role === "admin") return <AdminOverview />;
  if (user?.role === "expert") return <ExpertOverview />;

  // A farmer's overview is their fields.
  redirect("/fields");
}
