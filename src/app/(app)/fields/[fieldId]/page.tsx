import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";

import { serverFetch } from "@/lib/api";
import type { Field, Reading, SeriesBucket, Weather } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";
import { SafeImage } from "@/components/ui/SafeImage";
import { LiveReadings } from "@/components/field/LiveReadings";
import { FieldTrends } from "@/components/charts/FieldTrends";
import { WeatherCard } from "@/components/field/WeatherCard";
import { SoilProfileCard } from "@/components/field/SoilProfileCard";
import { ActuatorControls } from "@/components/field/ActuatorControls";
import { FieldInsight } from "@/components/field/FieldInsight";
import { EditFieldDialog } from "@/components/field/EditFieldDialog";
import { TimeAgo } from "@/components/ui/TimeAgo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fieldId: string }>;
}): Promise<Metadata> {
  const { fieldId } = await params;
  const field = await serverFetch<Field>(`/field/${fieldId}`);
  return { title: field?.fieldName ?? "Field" };
}

const ENV_LABEL: Record<Field["environmentType"], string> = {
  greenhouse: "Greenhouse",
  net_house: "Net house",
  open_field: "Open field",
};

/**
 * Everything except the advice is fetched server-side and in parallel, so the
 * page arrives complete. Advice is deliberately on demand — see FieldInsight.
 */
export default async function FieldDetailPage({
  params,
}: {
  params: Promise<{ fieldId: string }>;
}) {
  const { fieldId } = await params;

  const field = await serverFetch<Field>(`/field/${fieldId}`);
  if (!field) notFound();

  const [latest, series, weather] = await Promise.all([
    serverFetch<Reading | null>(`/sensorData/field/${fieldId}/latest`),
    serverFetch<SeriesBucket[]>(`/sensorData/field/${fieldId}/series?range=24h`),
    serverFetch<Weather>(`/field/${fieldId}/weather`),
  ]);

  const fresh =
    latest && Date.now() - new Date(latest.ts).getTime() < 10 * 60 * 1000;

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <Link
        href="/fields"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Dashboard
      </Link>

      {/* header */}
      <div className="relative mb-6 overflow-hidden rounded-card bg-bark">
        {field.fieldImage ? (
          <SafeImage
            src={field.fieldImage}
            alt=""
            width={1400}
            height={320}
            className="h-52 w-full object-cover opacity-70"
            priority
          />
        ) : (
          <div className="h-52 w-full" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bark via-bark/50 to-transparent" />

        <div className="absolute right-4 top-4">
          <EditFieldDialog field={field} />
        </div>

        <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-end justify-between gap-4 p-6">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Badge tone="onDark">{ENV_LABEL[field.environmentType]}</Badge>
              {fresh ? (
                <Badge tone="signal" className="gap-1.5">
                  <span className="relative flex h-1.5 w-1.5">
                    <span className="live-dot absolute inline-flex h-full w-full rounded-full bg-ink/70" />
                    <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-ink/70" />
                  </span>
                  Live
                </Badge>
              ) : (
                <Badge tone="onDark">
                  {latest ? (
                    <TimeAgo value={latest.ts} prefix="Last reading " />
                  ) : (
                    "No readings yet"
                  )}
                </Badge>
              )}
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-ink-invert">
              {field.fieldName}
            </h1>
            <p className="tabular mt-1 text-xs text-ink-invert/60">
              {field.fieldId}
            </p>
            <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-invert/70">
              <span className="capitalize">{field.fieldCrop}</span>
              {field.fieldSizeInAcres ? <span>· {field.fieldSizeInAcres} acres</span> : null}
              {field.soilType ? <span className="capitalize">· {field.soilType} soil</span> : null}
              <span className="inline-flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {field.fieldLocation.latitude.toFixed(3)},{" "}
                {field.fieldLocation.longitude.toFixed(3)}
              </span>
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div className="space-y-6">
          <LiveReadings fieldId={fieldId} farmerId={field.farmerId} initial={latest} />

          {/* Controls, weather and soil sit with the field's own data, not in
              the sidebar — the sidebar is for the advisor's suggestion, not
              for the facts it was given. */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-card bg-surface p-5 card-shadow">
              <h3 className="mb-4 text-sm font-semibold">Controls</h3>
              <ActuatorControls field={field} />
            </div>
            {weather ? <WeatherCard weather={weather} /> : null}
            <SoilProfileCard soilProfile={field.soilProfile} />
          </div>

          <FieldTrends fieldId={fieldId} initial={series ?? []} />
        </div>

        <aside>
          <FieldInsight fieldId={fieldId} />
        </aside>
      </div>
    </div>
  );
}
