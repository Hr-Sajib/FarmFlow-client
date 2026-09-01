"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Droplet, Umbrella, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { apiCall } from "@/lib/session";
import { cn } from "@/lib/utils";
import type { Field } from "@/lib/types";

function Toggle({
  label,
  description,
  icon: Icon,
  on,
  busy,
  onToggle,
}: {
  label: string;
  description: string;
  icon: typeof Droplet;
  on: boolean;
  busy: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-tile bg-surface-sunk px-4 py-3.5">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-9 w-9 items-center justify-center rounded-tile transition-colors",
            on ? "bg-canopy text-ink-invert" : "bg-surface text-ink-faint"
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.9} />
        </span>
        <div>
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-ink-faint">{description}</p>
        </div>
      </div>

      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        disabled={busy}
        onClick={onToggle}
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-pill transition-colors duration-200 disabled:opacity-60",
          on ? "bg-canopy" : "bg-line"
        )}
      >
        <span
          className={cn(
            "absolute top-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface transition-transform duration-200",
            on ? "translate-x-6" : "translate-x-1"
          )}
        >
          {busy ? <Loader2 className="h-3 w-3 animate-spin text-ink-soft" /> : null}
        </span>
      </button>
    </div>
  );
}

export function ActuatorControls({ field }: { field: Field }) {
  const router = useRouter();
  const [pending, setPending] = useState<"motor" | "shade" | null>(null);

  const toggle = async (which: "motor" | "shade", next: boolean) => {
    setPending(which);
    try {
      await apiCall(`/field/${field.fieldId}`, "PATCH", {
        [which === "motor" ? "isMotorOn" : "isShadeOn"]: next,
      });
      toast.success(
        `${which === "motor" ? "Irrigation" : "Shade"} ${next ? "on" : "off"} — command sent`
      );
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not send the command");
    } finally {
      setPending(null);
    }
  };

  return (
    <div className="space-y-2.5">
      <Toggle
        label="Irrigation"
        description={field.isMotorOn ? "Pump commanded on" : "Pump commanded off"}
        icon={Droplet}
        on={field.isMotorOn}
        busy={pending === "motor"}
        onToggle={() => toggle("motor", !field.isMotorOn)}
      />
      <Toggle
        label="Shade"
        description={field.isShadeOn ? "Shade commanded closed" : "Shade commanded open"}
        icon={Umbrella}
        on={field.isShadeOn}
        busy={pending === "shade"}
        onToggle={() => toggle("shade", !field.isShadeOn)}
      />
      {/* The device does not acknowledge, so the UI says what was asked for
          rather than claiming to know the hardware state. */}
      <p className="px-1 text-[0.6875rem] leading-relaxed text-ink-faint">
        Commands are sent to the field controller. The device does not report
        back, so this shows what was requested, not confirmed hardware state.
      </p>
    </div>
  );
}
