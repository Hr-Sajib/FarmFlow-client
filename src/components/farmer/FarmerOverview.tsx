import Link from "next/link";
import {
  MessagesSquare,
  Plus,
  Radio,
  Sprout,
  Users2,
} from "lucide-react";

import { serverFetch } from "@/lib/api";
import type { FarmerOverview as Overview } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Unavailable } from "@/components/ui/Unavailable";
import { TimeAgo } from "@/components/ui/TimeAgo";
import { StatBars } from "@/components/expert/StatBars";
import { MetricChart } from "@/components/charts/MetricChart";
import { METRIC_ORDER } from "@/components/charts/seriesTheme";

const ENV_LABEL: Record<string, string> = {
  greenhouse: "Greenhouse",
  net_house: "Net house",
  open_field: "Open field",
};

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
  action,
  children,
}: {
  title: string;
  icon: typeof Sprout;
  action?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <section className="rounded-card bg-surface p-6 card-shadow">
    <div className="mb-5 flex items-center justify-between gap-3">
      <h2 className="flex items-center gap-2 font-display text-base font-semibold tracking-tight">
        <span className="flex h-8 w-8 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </span>
        {title}
      </h2>
      {action}
    </div>
    {children}
  </section>
);

/**
 * A farmer's own record: their fields (and whether those fields are actually
 * reporting), their advisory activity, and the farm-wide 24h trend.
 *
 * A different question from the admin's platform summary or an expert's
 * caseload, so it is its own endpoint rather than either filtered.
 */
export async function FarmerOverview() {
  const data = await serverFetch<Overview>("/farmer/overview");

  if (!data) {
    return (
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <Unavailable what="your overview" />
      </div>
    );
  }

  const { fields, advisories, community, latestByField, trend } = data;
  const hasTrend = trend.some((b) => b.samples > 0);

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-7 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">
          Overview
        </h1>
        <Button asChild variant="primary">
          <Link href="/fields/new">
            <Plus className="h-4 w-4" />
            Add field
          </Link>
        </Button>
      </header>

      {fields.total === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface/60 px-8 py-14 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
            <Sprout className="h-5 w-5" strokeWidth={1.85} />
          </span>
          <h2 className="font-display text-lg font-semibold">No fields yet</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-soft">
            Register a field with its location and crop, and this page fills in
            with live readings and trends.
          </p>
          <Button asChild variant="primary" className="mt-6">
            <Link href="/fields/new">
              <Plus className="h-4 w-4" />
              Add your first field
            </Link>
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid gap-5 lg:grid-cols-3">
            <Panel title="Fields" icon={Sprout}>
              <dl className="grid grid-cols-3 gap-5">
                <Figure label="Total" value={fields.total} />
                <Figure label="Active" value={fields.active} />
                <Figure
                  label="Reporting"
                  value={fields.reporting}
                  hint="in the last 10 min"
                />
              </dl>
            </Panel>

            <Panel title="Advisories" icon={MessagesSquare}>
              <dl className="grid grid-cols-3 gap-5">
                <Figure label="Total" value={advisories.total} />
                <Figure label="Open" value={advisories.active} />
                <Figure label="Resolved" value={advisories.resolved} />
              </dl>
              {advisories.total > 0 ? (
                <div className="mt-5">
                  <StatBars
                    max={Math.max(advisories.total, 1)}
                    bars={[
                      { label: "Resolved", value: advisories.resolved, color: "#1baf7a" },
                      { label: "Still open", value: advisories.active, color: "#eda100" },
                    ]}
                  />
                </div>
              ) : (
                <p className="mt-4 text-sm text-ink-faint">
                  Ask about a field from its detail page to start one.
                </p>
              )}
            </Panel>

            <Panel title="Community" icon={Users2}>
              <dl className="grid grid-cols-2 gap-5">
                <Figure label="Posts" value={community.posts} />
                <Figure label="Comments" value={community.comments} />
                <Figure label="Followers" value={community.followers} />
                <Figure label="Following" value={community.following} />
              </dl>
            </Panel>
          </div>

          <Panel title="Your fields" icon={Radio}>
            <ul className="divide-y divide-line">
              {latestByField.map((f) => (
                <li key={f.fieldId} className="py-3 first:pt-0 last:pb-0">
                  <Link
                    href={`/fields/${f.fieldId}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-tile px-2 py-1.5 transition-colors hover:bg-surface-sunk"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-ink">
                        {f.fieldName}
                      </p>
                      <p className="truncate text-xs text-ink-faint">
                        {ENV_LABEL[f.environmentType] ?? f.environmentType}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      {f.ts ? (
                        <p className="tabular hidden text-xs text-ink-soft sm:block">
                          {f.temperature?.toFixed(1) ?? "—"}°C ·{" "}
                          {f.soilMoisture?.toFixed(0) ?? "—"}% soil
                        </p>
                      ) : null}
                      {f.isReporting ? (
                        <Badge tone="signal" className="gap-1.5">
                          <span className="relative flex h-1.5 w-1.5">
                            <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-ink/70" />
                            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ink/70" />
                          </span>
                          Live
                        </Badge>
                      ) : (
                        <Badge tone="neutral">
                          {f.ts ? <TimeAgo value={f.ts} /> : "No data yet"}
                        </Badge>
                      )}
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </Panel>

          <section>
            <h2 className="mb-4 font-display text-lg font-semibold tracking-tight">
              Farm trend · 24h
            </h2>
            {hasTrend ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {METRIC_ORDER.map((metric) => (
                  <MetricChart key={metric} metric={metric} data={trend} range="24h" />
                ))}
              </div>
            ) : (
              <div className="rounded-card bg-surface p-8 text-center card-shadow">
                <p className="text-sm text-ink-faint">
                  No readings across your fields in the last 24 hours yet.
                </p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
