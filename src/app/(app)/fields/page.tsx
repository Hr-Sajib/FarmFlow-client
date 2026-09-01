import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Sprout } from "lucide-react";

import { serverFetch } from "@/lib/api";
import type { Field, Reading, SeriesBucket, User } from "@/lib/types";
import { FieldCard } from "@/components/dashboard/FieldCard";
import { Unavailable } from "@/components/ui/Unavailable";

export const metadata: Metadata = { title: "All fields" };

/** Admin-only overview of every field in the system. */
export default async function AllFieldsPage() {
  const me = await serverFetch<User>("/user/me");
  if (me?.role !== "admin") redirect("/dashboard");

  // null means the request failed; [] means there genuinely are none.
  const fields = await serverFetch<Field[]>("/field");

  const enriched = await Promise.all(
    (fields ?? []).map(async (field) => {
      const [latest, series] = await Promise.all([
        serverFetch<Reading | null>(`/sensorData/field/${field.fieldId}/latest`),
        serverFetch<SeriesBucket[]>(`/sensorData/field/${field.fieldId}/series?range=24h`),
      ]);
      return { field, latest: latest ?? null, series: series ?? [] };
    })
  );

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-6">
        <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">
          All fields
        </h1>
        {/* No count when the load failed — "0 fields" would be a claim, not a
            fact. */}
        {fields ? (
          <p className="mt-1 text-sm text-ink-soft">
            {fields.length} field{fields.length === 1 ? "" : "s"} across every farm
          </p>
        ) : null}
      </header>

      {fields === null ? (
        <Unavailable what="the field list" />
      ) : enriched.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-surface/60 px-8 py-14 text-center">
          <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
            <Sprout className="h-5 w-5" strokeWidth={1.85} />
          </span>
          <p className="text-sm text-ink-soft">No fields registered yet.</p>
        </div>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {enriched.map(({ field, latest, series }) => (
            <div key={field.fieldId}>
              <FieldCard field={field} latest={latest} series={series} />
              <p className="tabular mt-1.5 px-1 text-xs text-ink-faint">
                {field.farmerId}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
