import type { Metadata } from "next";

import { serverFetch } from "@/lib/api";
import type { User } from "@/lib/types";
import { AdminOverview } from "@/components/admin/AdminOverview";
import { ExpertOverview } from "@/components/expert/ExpertOverview";
import { FarmerOverview } from "@/components/farmer/FarmerOverview";

export const metadata: Metadata = { title: "Overview" };

/**
 * The landing page after sign-in for every role. What counts as "an
 * overview" differs by role — platform-wide for an admin, caseload for an
 * expert, a farmer's own fields and their trend for a farmer — so each gets
 * its own component rather than one view filtered three ways.
 */
export default async function OverviewPage() {
  const user = await serverFetch<User>("/user/me");

  if (user?.role === "admin") return <AdminOverview />;
  if (user?.role === "expert") return <ExpertOverview />;
  return <FarmerOverview />;
}
