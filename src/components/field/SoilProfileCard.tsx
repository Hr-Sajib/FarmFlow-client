import { FlaskConical, Layers } from "lucide-react";

import type { Field } from "@/lib/types";
import { Card, CardHeader } from "@/components/ui/Card";
import { TimeAgo } from "@/components/ui/TimeAgo";

/**
 * Composition at this field's exact coordinates, from ISRIC SoilGrids —
 * fetched once when the location is set and stored on the field, so this
 * renders from the page's own data with no extra round trip.
 */
export function SoilProfileCard({ soilProfile }: { soilProfile: Field["soilProfile"] }) {
  if (!soilProfile) {
    return (
      <Card className="p-5">
        <CardHeader title="Soil profile" subtitle="ISRIC SoilGrids, 0–5cm depth" />
        <p className="mt-4 text-sm text-ink-faint">
          No coverage at these coordinates yet.
        </p>
      </Card>
    );
  }

  const { clay, silt, sand, ph, organicCarbon, fetchedAt } = soilProfile;
  const texture = [
    { label: "Sand", value: sand, className: "bg-amber-400" },
    { label: "Silt", value: silt, className: "bg-canopy/60" },
    { label: "Clay", value: clay, className: "bg-bark/70" },
  ];

  return (
    <Card className="p-5">
      <CardHeader
        title="Soil profile"
        subtitle={
          <>
            ISRIC SoilGrids, 0–5cm depth · <TimeAgo value={fetchedAt} />
          </>
        }
      />

      <div className="mt-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-[0.6875rem] text-ink-faint">
          <Layers className="h-3 w-3" /> Texture
        </div>
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-surface-sunk">
          {texture.map((t) => (
            <div
              key={t.label}
              className={t.className}
              style={{ width: `${t.value}%` }}
              title={`${t.label} ${t.value.toFixed(1)}%`}
            />
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
          {texture.map((t) => (
            <span key={t.label} className="tabular inline-flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${t.className}`} />
              {t.label} {t.value.toFixed(1)}%
            </span>
          ))}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-line pt-4">
        <div>
          <dt className="flex items-center gap-1 text-[0.6875rem] text-ink-faint">
            <FlaskConical className="h-3 w-3" /> pH
          </dt>
          <dd className="tabular mt-0.5 text-sm font-medium text-ink">
            {ph.toFixed(1)}
          </dd>
        </div>
        <div>
          <dt className="text-[0.6875rem] text-ink-faint">Organic carbon</dt>
          <dd className="tabular mt-0.5 text-sm font-medium text-ink">
            {organicCarbon.toFixed(1)} g/kg
          </dd>
        </div>
      </dl>
    </Card>
  );
}
