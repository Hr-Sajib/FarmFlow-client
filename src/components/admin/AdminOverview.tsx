import { serverFetch } from "@/lib/api";
import type { AdminOverview as Overview } from "@/lib/types";
import { StatSection, Stat, ChartPanel } from "./StatSection";
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
export async function AdminOverview() {
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
          Overview
        </h1>
      </header>

      {/* Ten columns rather than twelve, so 40/30/30 on the first row and
          50/50 on the second are exact rather than rounded. */}
      <div className="grid gap-5 lg:grid-cols-10">
        <StatSection
          title="Farmers"
          // The subject sits behind the chart rather than behind the section:
          // the chart occupies everything past the first fifth, so that is
          // where there is room for it to be seen.
          chartImage={`${BG}/farmer_symbolic_bg_image.jpeg`}
          className="lg:col-span-4"
          chart={
            <GrowthChart data={farmers.monthly} color="#1baf7a" label="Farmers" />
          }
          split="wide"
        >
          <dl className="flex flex-col gap-4">
            <Stat label="Total" value={farmers.total} />
            <Stat label="Active" value={farmers.active} />
            <Stat
              label="With fields"
              value={farmers.fieldIntegrated}
              hint="own an active field"
            />
          </dl>
        </StatSection>

        <StatSection
          title="Experts"
          image={`${BG}/expert_symbolic_bg_image.png`}
          placement="inset-y-0 left-0 w-1/2"
          scrim="bg-gradient-to-l from-bark via-bark/85 to-bark/45"
          className="lg:col-span-4"
          aside={
            <ChartPanel>
              <GrowthChart data={experts.monthly} color="#2a78d6" label="Experts" />
            </ChartPanel>
          }
          footer={
            // Counted per designation — one expert may hold several at
            // different points in review.
            <dl className="grid grid-cols-3 gap-4 border-t border-white/15 pt-4">
              <Stat label="Pending" value={experts.pendingDesignations} />
              <Stat label="Approved" value={experts.approvedDesignations} />
              <Stat label="Rejected" value={experts.rejectedDesignations} />
            </dl>
          }
        >
          <dl className="flex flex-col gap-4">
            <Stat label="Total" value={experts.total} />
            <Stat label="Active" value={experts.active} />
            <Stat
              label="Designated"
              value={experts.designated}
              hint="at least one credential"
            />
          </dl>
        </StatSection>

        <StatSection
          title="Fields"
          image={`${BG}/field_symbolic_bg_image.png`}
          // Inset and contained rather than cropped to the width: the artwork
          // reads as an object, and cover was cutting it off at both edges.
          // The object position carries it off centre, down and to the right.
          placement="inset-8"
          imageClass="object-contain object-[72%_74%]"
          scrim="bg-gradient-to-b from-bark via-bark/85 to-bark/45"
          className="lg:col-span-2"
        >
          <dl className="flex flex-col gap-4">
            <Stat label="Total" value={fields.total} />
            <Stat label="Active" value={fields.active} />
          </dl>
        </StatSection>

        <StatSection
          title="Advisories"
          image={`${BG}/advisorySession_symbolic_bg.png`}
          placement="inset-y-0 right-0 w-1/2"
          imageClass="object-contain object-center"
          scrim="bg-gradient-to-r from-bark via-bark/85 to-bark/45"
          className="lg:col-span-5"
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
          image={`${BG}/forum_symbolic_bg.png`}
          placement="inset-y-0 right-0 w-3/5"
          imageClass="object-contain object-center"
          scrim="bg-gradient-to-r from-bark via-bark/85 to-bark/45"
          className="lg:col-span-5"
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
