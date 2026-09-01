import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Sprout } from "lucide-react";

import { serverFetch } from "@/lib/api";
import type { Field, Reading, SeriesBucket, User } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { FieldCard } from "@/components/dashboard/FieldCard";
import { LiveFieldSync } from "@/components/dashboard/LiveFieldSync";
import { Unavailable } from "@/components/ui/Unavailable";

export const metadata: Metadata = { title: "Dashboard" };

const greeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
};

/**
 * Server component. Fields, their latest readings and their 24h trends are all
 * fetched here in parallel, so the page arrives populated rather than
 * rendering skeletons and filling in after hydration.
 */
export default async function DashboardPage() {
  const user = await serverFetch<User>("/user/me");
  // Left nullable on purpose: null is "the request failed", [] is "this farmer
  // has no fields". Collapsing them would report a dead backend as data loss.
  const fields = await serverFetch<Field[]>(
    user?.role === "admin" ? "/field" : "/field/myFields"
  );

  const enriched = await Promise.all(
    (fields ?? []).map(async (field) => {
      const [latest, series] = await Promise.all([
        serverFetch<Reading | null>(`/sensorData/field/${field.fieldId}/latest`),
        serverFetch<SeriesBucket[]>(
          `/sensorData/field/${field.fieldId}/series?range=24h`
        ),
      ]);
      return { field, latest: latest ?? null, series: series ?? [] };
    })
  );

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">
            {greeting()}, {user?.fullName.split(" ")[0]}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">
            {enriched.length
              ? `${enriched.length} field${enriched.length > 1 ? "s" : ""} reporting`
              : "Add a field to start seeing readings"}
          </p>
        </div>

        <Button asChild variant="primary">
          <Link href="/fields/new">
            <Plus className="h-4 w-4" />
            Add field
          </Link>
        </Button>
      </header>

      {fields === null ? (
        <Unavailable what="your fields" />
      ) : enriched.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface/60 px-8 py-16 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
            <Sprout className="h-5 w-5" strokeWidth={1.85} />
          </span>
          <h2 className="font-display text-lg font-semibold">No fields yet</h2>
          <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-soft">
            Register a field with its location and crop, and readings from its
            sensor node will start appearing here.
          </p>
          <Button asChild variant="primary" className="mt-6">
            <Link href="/fields/new">
              <Plus className="h-4 w-4" />
              Add your first field
            </Link>
          </Button>
        </div>
      ) : (
        <>
          <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {enriched.map(({ field, latest, series }) => (
              <FieldCard
                key={field.fieldId}
                field={field}
                latest={latest}
                series={series}
              />
            ))}
          </div>
          {/* Client island: keeps the server-rendered cards current. */}
          <LiveFieldSync />
        </>
      )}
    </div>
  );
}
