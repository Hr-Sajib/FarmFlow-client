import {
  BadgeCheck,
  MessagesSquare,
  Star,
  Users2,
} from "lucide-react";

import { serverFetch } from "@/lib/api";
import type { ExpertOverview as Overview } from "@/lib/types";
import { Unavailable } from "@/components/ui/Unavailable";
import { StatBars } from "./StatBars";

const Figure = ({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) => (
  <div>
    <dt className="text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-ink-faint">
      {label}
    </dt>
    <dd className="tabular mt-1 font-display text-3xl font-semibold">{value}</dd>
    {hint ? <p className="mt-0.5 text-[0.6875rem] text-ink-faint">{hint}</p> : null}
  </div>
);

const Panel = ({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof Star;
  children: React.ReactNode;
}) => (
  <section className="rounded-card bg-surface p-6 card-shadow">
    <h2 className="mb-5 flex items-center gap-2 font-display text-base font-semibold tracking-tight">
      <span className="flex h-8 w-8 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
        <Icon className="h-4 w-4" strokeWidth={1.9} />
      </span>
      {title}
    </h2>
    {children}
  </section>
);

/**
 * An expert's own record: how much they have been asked for, and how it went.
 *
 * A different question from the admin's platform summary, so it is a different
 * page rather than the same one filtered — the figures an expert acts on are
 * about their own queue, not about how many accounts exist.
 */
export async function ExpertOverview() {
  const data = await serverFetch<Overview>("/expert/overview");

  if (!data) {
    return (
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <Unavailable what="your overview" />
      </div>
    );
  }

  const { advisories, community, reviews, designations } = data;
  const handled = advisories.resolved + advisories.active;

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-7">
        <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">
          Overview
        </h1>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <Panel title="Advisories" icon={MessagesSquare}>
          <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Figure label="Requested" value={advisories.requested} />
            <Figure label="Resolved" value={advisories.resolved} />
            <Figure label="Open" value={advisories.active} />
            <Figure
              label="Farmers"
              value={advisories.farmersHelped}
              hint="you have helped"
            />
          </dl>
          <div className="mt-5">
            <StatBars
              // Requested is the whole of the work; the rest are parts of it,
              // so they share its scale rather than each being drawn to its own.
              max={Math.max(advisories.requested, 1)}
              bars={[
                { label: "Resolved", value: advisories.resolved, color: "#1baf7a" },
                { label: "Still open", value: advisories.active, color: "#eda100" },
                {
                  label: "Not taken up",
                  value: Math.max(advisories.requested - handled, 0),
                  color: "#8B9990",
                },
              ]}
            />
          </div>
        </Panel>

        <Panel title="Reviews" icon={Star}>
          <dl className="grid grid-cols-2 gap-5">
            <Figure
              label="Average"
              value={reviews.averageStars ?? "—"}
              hint={reviews.count ? "out of 5" : "no ratings yet"}
            />
            <Figure label="Ratings" value={reviews.count} />
          </dl>
          {reviews.averageStars !== null ? (
            <div className="mt-5">
              <StatBars
                max={5}
                bars={[
                  {
                    label: "Average score",
                    value: reviews.averageStars,
                    color: "#eb6834",
                  },
                ]}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-faint">
              Ratings appear once a farmer scores a conversation you resolved.
            </p>
          )}
        </Panel>

        <Panel title="Community" icon={Users2}>
          <dl className="grid grid-cols-3 gap-5">
            <Figure label="Posts" value={community.posts} />
            <Figure label="Comments" value={community.comments} />
            <Figure label="Followers" value={community.followers} />
          </dl>
        </Panel>

        <Panel title="Credentials" icon={BadgeCheck}>
          <dl className="grid grid-cols-2 gap-5 sm:grid-cols-4">
            <Figure label="Submitted" value={designations.total} />
            <Figure label="Verified" value={designations.verified} />
            <Figure label="Pending" value={designations.pending} />
            <Figure label="Rejected" value={designations.rejected} />
          </dl>
          {designations.total > 0 ? (
            <div className="mt-5">
              <StatBars
                max={designations.total}
                bars={[
                  { label: "Verified", value: designations.verified, color: "#1baf7a" },
                  { label: "Pending", value: designations.pending, color: "#eda100" },
                  { label: "Rejected", value: designations.rejected, color: "#C2412D" },
                ]}
              />
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-faint">
              Add a credential from your profile to be verified.
            </p>
          )}
        </Panel>
      </div>
    </div>
  );
}
