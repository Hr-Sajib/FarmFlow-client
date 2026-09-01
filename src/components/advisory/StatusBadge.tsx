import { Badge } from "@/components/ui/Badge";
import type { AdvisoryStatus } from "@/lib/types";

/**
 * Status carries an icon-free label plus a distinct tone, so the state is never
 * communicated by colour alone.
 */
const STATUS: Record<
  AdvisoryStatus,
  { label: string; tone: "neutral" | "canopy" | "signal" | "warn" | "alert" }
> = {
  ai_active: { label: "AI advisor", tone: "canopy" },
  awaiting_expert: { label: "Waiting for expert", tone: "warn" },
  expert_active: { label: "Expert joined", tone: "signal" },
  resolved: { label: "Resolved", tone: "neutral" },
  closed: { label: "Closed", tone: "neutral" },
};

export function StatusBadge({ status }: { status: AdvisoryStatus }) {
  const spec = STATUS[status] ?? STATUS.ai_active;
  return <Badge tone={spec.tone}>{spec.label}</Badge>;
}
