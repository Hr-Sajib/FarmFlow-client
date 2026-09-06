import type { Metadata } from "next";
import Link from "next/link";
import { Plus, Sprout } from "lucide-react";

import { serverFetch } from "@/lib/api";
import type { Field, Reading, SeriesBucket, User } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { FieldCard } from "@/components/dashboard/FieldCard";
import { LiveFieldSync } from "@/components/dashboard/LiveFieldSync";
import { Unavailable } from "@/components/ui/Unavailable";

export const metadata: Metadata = { title: "Fields" };

/**
 * One page for both roles. A farmer sees the fields they own, an admin sees
 * every field; the layout, padding and card size are identical either way,
 * because the difference between the two is whose fields these are, not how a
 * field should look.
 */
export default async function FieldsPage() {
  const me = await serverFetch<User>("/user/me");
  const isAdmin = me?.role === "admin";

  // null means the request failed; [] means there genuinely are none.
  const fields = await serverFetch<Field[]>(
    isAdmin ? "/field" : "/field/myFields"
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
      {/* Capped to the width this column has when the sidebar is expanded, and
          centred. The cap is measured from the viewport rather than from the
          parent, so it does not move when the sidebar does: collapsing the rail
          hands this column 180px it would otherwise pass on to the cards,
          stretching every one of them. That space becomes padding instead, and
          a card is the same size whatever the sidebar is doing.

          100vw - (sidebar track 17.25rem + this page's 5rem of side padding). */}
      <div className="mx-auto w-full lg:max-w-[calc(100vw-22.25rem)]">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">
              {isAdmin ? "All fields" : "Fields"}
            </h1>
            {/* No count when the load failed — "0 fields" would be a claim,
                not a fact. */}
            {fields ? (
              <p className="mt-1 text-sm text-ink-soft">
                {fields.length} field{fields.length === 1 ? "" : "s"}
                {isAdmin ? " across every farm" : " reporting"}
              </p>
            ) : null}
          </div>

          {/* Only a farmer owns fields, so only a farmer can add one. */}
          {!isAdmin ? (
            <Button asChild variant="primary">
              <Link href="/fields/new">
                <Plus className="h-4 w-4" />
                Add field
              </Link>
            </Button>
          ) : null}
        </header>

        {fields === null ? (
          <Unavailable what={isAdmin ? "the field list" : "your fields"} />
        ) : enriched.length === 0 ? (
          <div className="rounded-card border border-dashed border-line bg-surface/60 px-8 py-14 text-center">
            <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
              <Sprout className="h-5 w-5" strokeWidth={1.85} />
            </span>
            {isAdmin ? (
              <p className="text-sm text-ink-soft">No fields registered yet.</p>
            ) : (
              <>
                <h2 className="font-display text-lg font-semibold">
                  No fields yet
                </h2>
                <p className="mx-auto mt-1.5 max-w-sm text-sm text-ink-soft">
                  Register a field with its location and crop, and readings from
                  its sensor node will start appearing here.
                </p>
                <Button asChild variant="primary" className="mt-6">
                  <Link href="/fields/new">
                    <Plus className="h-4 w-4" />
                    Add your first field
                  </Link>
                </Button>
              </>
            )}
          </div>
        ) : (
          <>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {enriched.map(({ field, latest, series }) => (
                <div key={field.fieldId}>
                  <FieldCard field={field} latest={latest} series={series} />
                  {/* Whose field it is only matters when they are not all yours. */}
                  {isAdmin ? (
                    <p className="tabular mt-1.5 px-1 text-xs text-ink-faint">
                      {field.farmerId}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
            {/* Live tiles for the owner's own fields. */}
            {!isAdmin ? <LiveFieldSync /> : null}
          </>
        )}
      </div>
    </div>
  );
}
