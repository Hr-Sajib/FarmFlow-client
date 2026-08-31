"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, LocateFixed } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input, FormField, Label } from "@/components/ui/Field";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { apiCall } from "@/lib/session";
import type { Field } from "@/lib/types";

const SOIL_TYPES = ["clay", "loam", "sandy", "silt", "peat", "chalk", "saline"] as const;
const ENVIRONMENTS = [
  { value: "greenhouse", label: "Greenhouse" },
  { value: "net_house", label: "Net house" },
  { value: "open_field", label: "Open field" },
] as const;

const schema = z.object({
  fieldName: z.string().min(2, "Give the field a name you'll recognise"),
  fieldCrop: z.string().min(2, "What's growing there?"),
  latitude: z.coerce.number().min(-90).max(90),
  longitude: z.coerce.number().min(-180).max(180),
  fieldSizeInAcres: z.coerce.number().nonnegative().optional(),
  soilType: z.enum(SOIL_TYPES).optional(),
  environmentType: z.enum(["greenhouse", "net_house", "open_field"]),
  region: z.string().optional(),
});

type Values = z.infer<typeof schema>;

export function NewFieldForm() {
  const router = useRouter();
  const [image, setImage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { environmentType: "greenhouse" },
  });

  /** Coordinates are fiddly to type; offer the device's own if permitted. */
  const useMyLocation = () => {
    if (!navigator.geolocation) {
      toast.error("This browser can't share a location");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setValue("latitude", Number(pos.coords.latitude.toFixed(6)));
        setValue("longitude", Number(pos.coords.longitude.toFixed(6)));
        toast.success("Location filled in");
      },
      () => toast.error("Couldn't read your location. Enter it manually.")
    );
  };

  const onSubmit = async (values: Values) => {
    if (!image) {
      toast.error("Add a photo of the field");
      return;
    }

    setSubmitting(true);
    try {
      const field = await apiCall<Field>("/field", "POST", {
        fieldName: values.fieldName,
        fieldImage: image,
        fieldCrop: values.fieldCrop,
        fieldLocation: { latitude: values.latitude, longitude: values.longitude },
        ...(values.fieldSizeInAcres ? { fieldSizeInAcres: values.fieldSizeInAcres } : {}),
        ...(values.soilType ? { soilType: values.soilType } : {}),
        environmentType: values.environmentType,
        ...(values.region ? { region: values.region } : {}),
      });

      toast.success(`${field.fieldName} added`);
      router.refresh();
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add field");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-5">
      <div>
        <Label>Field photo</Label>
        <ImageUpload value={image} onChange={setImage} category="fields" label="Add a photo" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Field name" error={errors.fieldName?.message}>
          <Input placeholder="Greenhouse 02" invalid={Boolean(errors.fieldName)} {...register("fieldName")} />
        </FormField>
        <FormField label="Crop" error={errors.fieldCrop?.message}>
          <Input placeholder="Tomato" invalid={Boolean(errors.fieldCrop)} {...register("fieldCrop")} />
        </FormField>
      </div>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-xs font-medium text-ink-soft">Location</span>
          <button
            type="button"
            onClick={useMyLocation}
            className="inline-flex items-center gap-1 text-xs text-canopy hover:underline"
          >
            <LocateFixed className="h-3.5 w-3.5" />
            Use my location
          </button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input type="number" step="any" placeholder="Latitude · 23.8103" invalid={Boolean(errors.latitude)} {...register("latitude")} />
          <Input type="number" step="any" placeholder="Longitude · 90.4125" invalid={Boolean(errors.longitude)} {...register("longitude")} />
        </div>
        {errors.latitude || errors.longitude ? (
          <p className="mt-1.5 text-xs text-alert">Enter both coordinates as decimals</p>
        ) : null}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>Environment</Label>
          <select
            {...register("environmentType")}
            className="w-full rounded-tile border border-line bg-surface px-4 py-3 text-sm text-ink focus:border-canopy focus:outline-none focus:ring-2 focus:ring-canopy/15"
          >
            {ENVIRONMENTS.map((e) => (
              <option key={e.value} value={e.value}>{e.label}</option>
            ))}
          </select>
        </div>
        <div>
          <Label>Soil type</Label>
          <select
            {...register("soilType")}
            className="w-full rounded-tile border border-line bg-surface px-4 py-3 text-sm capitalize text-ink focus:border-canopy focus:outline-none focus:ring-2 focus:ring-canopy/15"
          >
            <option value="">Not sure</option>
            {SOIL_TYPES.map((s) => (
              <option key={s} value={s} className="capitalize">{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label="Size" hint="In acres — optional">
          <Input type="number" step="any" placeholder="0.5" {...register("fieldSizeInAcres")} />
        </FormField>
        <FormField label="Region" hint="Optional">
          <Input placeholder="Dhaka" {...register("region")} />
        </FormField>
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding field
          </>
        ) : (
          "Add field"
        )}
      </Button>
    </form>
  );
}
