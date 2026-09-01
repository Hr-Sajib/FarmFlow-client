import { serverFetch } from "@/lib/api";
import type { AdminOverview as Overview } from "@/lib/types";
import { StatSection, Stat } from "./StatSection";
import { GrowthChart } from "./GrowthChart";
import { Unavailable } from "@/components/ui/Unavailable";

const BG = "/assets/adminOverviewPageSectionBGs";

/**
 * The admin's overview: the platform by module rather than by field.
 *
 * An admin owns no fields, so the farmer's dashboard has nothing on it for
 * them. This answers the questions the role actually has — how many people are
 * here, how many are set up, and what the platform is doing.
 */
export async function AdminOverview({ name }: { name: string }) {
  const data = await serverFetch<Overview>("/admin/overview");

  if (!data) {
    return (
      <div className="px-6 py-8 lg:px-10 lg:py-10">
        <Unavailable what="the platform overview" />
      </div>
    );
  }

  const { farmers, experts, fields, advisories, forum } = data;

  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <header className="mb-7">
        <h1 className="font-display text-2xl font-semibold tracking-tight lg:text-3xl">
          Good morning, {name.split(" ")[0]}
        </h1>
        <p className="mt-1 text-sm text-ink-soft">
          Everything on the platform, by module.
        </p>
      </header>

      <div className="grid gap-5 lg:grid-cols-2">
        <StatSection
          title="Farmers"
          description="Who is growing, and who is actually wired up."
          image={`${BG}/farmer_symbolic_bg_image.jpeg`}
          placement="inset-y-0 right-0 w-3/5"
          scrim="bg-gradient-to-r from-bark via-bark/85 to-bark/45"
        >
          <dl className="grid grid-cols-3 gap-4">
            <Stat label="Total" value={farmers.total} />
            <Stat label="Active" value={farmers.active} />
            <Stat
              label="With fields"
              value={farmers.fieldIntegrated}
              hint="own an active field"
            />
          </dl>
          <div className="mt-5">
            <GrowthChart data={farmers.monthly} color="#1baf7a" label="Farmers" />
          </div>
        </StatSection>

        <StatSection
          title="Experts"
          description="Agronomists and the state of their credentials."
          image={`${BG}/expert_symbolic_bg_image.png`}
          placement="inset-y-0 left-0 w-1/2"
          scrim="bg-gradient-to-l from-bark via-bark/85 to-bark/45"
        >
          <dl className="grid grid-cols-3 gap-4">
            <Stat label="Total" value={experts.total} />
            <Stat label="Active" value={experts.active} />
            <Stat
              label="Designated"
              value={experts.designated}
              hint="at least one credential"
            />
          </dl>
          {/* Counted per designation — one expert may hold several at
              different points in review. */}
          <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-white/15 pt-4">
            <Stat label="Pending" value={experts.pendingDesignations} />
            <Stat label="Approved" value={experts.approvedDesignations} />
            <Stat label="Rejected" value={experts.rejectedDesignations} />
          </dl>
          <div className="mt-5">
            <GrowthChart data={experts.monthly} color="#2a78d6" label="Experts" />
          </div>
        </StatSection>

        <StatSection
          title="Fields"
          description="Registered plots and how many are reporting."
          image={`${BG}/field_symbolic_bg_image.png`}
          placement="inset-x-0 bottom-0 h-2/3"
          scrim="bg-gradient-to-b from-bark via-bark/85 to-bark/45"
        >
          <dl className="grid grid-cols-2 gap-4">
            <Stat label="Total" value={fields.total} />
            <Stat label="Active" value={fields.active} />
          </dl>
        </StatSection>

        <StatSection
          title="Advisories"
          description="What the AI answered, and what needed a person."
          image={`${BG}/advisorySession_symbolic_bg.png`}
          placement="inset-y-0 right-0 w-1/2"
          scrim="bg-gradient-to-r from-bark via-bark/85 to-bark/45"
        >
          <dl className="grid grid-cols-2 gap-4">
            <Stat label="Sessions" value={advisories.total} />
            <Stat label="Open" value={advisories.active} />
            <Stat
              label="AI handled"
              value={advisories.aiHandled}
              hint="never escalated"
            />
            <Stat
              label="Expert needed"
              value={advisories.expertNeeded}
              hint="reached a human"
            />
          </dl>
        </StatSection>

        <StatSection
          title="Forum"
          description="What the community is asking and answering."
          image={`${BG}/forum_symbolic_bg.png`}
          placement="inset-y-0 right-0 w-3/5"
          scrim="bg-gradient-to-r from-bark via-bark/85 to-bark/45"
        >
          <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Stat label="Posts" value={forum.posts} />
            <Stat
              label="Contributors"
              value={forum.contributors}
              hint="have posted"
            />
            <Stat label="Comments" value={forum.comments} />
            <Stat
              label="Impressions"
              value={forum.impressions}
              hint="likes and dislikes"
            />
          </dl>
        </StatSection>
      </div>
    </div>
  );
}
