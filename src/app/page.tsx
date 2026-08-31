import Link from "next/link";
import {
  ArrowRight,
  Radio,
  MessageSquareText,
  UserCheck,
  Waves,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ContourField } from "@/components/marketing/ContourField";
import { LiveReadout } from "@/components/marketing/LiveReadout";

/**
 * Fully server-rendered. The only client code on this page is the live readout
 * in the hero, which has to move to make its point.
 */

const STEPS = [
  {
    icon: Radio,
    title: "Sensors report continuously",
    body: "A low-cost ESP32 node in each greenhouse publishes temperature, humidity, soil moisture and light over MQTT. Readings land in seconds, not on your next walk-through.",
  },
  {
    icon: Waves,
    title: "The dashboard shows what changed",
    body: "Every field is a live card. Trends run alongside the current reading, so a drift that would take days to notice by eye shows up as a slope.",
  },
  {
    icon: MessageSquareText,
    title: "Ask, in your own language",
    body: "Describe the problem or photograph the leaf. The advisor answers in Bangla or English, reading your actual sensor values rather than generic guidance.",
  },
  {
    icon: UserCheck,
    title: "Escalate to a real expert",
    body: "When a diagnosis needs a human, the same conversation is handed to a verified agronomist. Nothing is retyped and no context is lost.",
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen">
      {/* ---------- header ---------- */}
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <span className="font-display text-lg font-semibold tracking-tight">
          Farm<span className="text-canopy">Flow</span>
        </span>
        <nav className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link href="/register">Create account</Link>
          </Button>
        </nav>
      </header>

      {/* ---------- hero ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-20 pt-8 lg:pt-16">
        <div className="relative overflow-hidden rounded-[2rem] bg-bark px-8 py-14 text-ink-invert lg:px-14 lg:py-20">
          <ContourField className="pointer-events-none absolute inset-0 h-full w-full text-shoot/25" />

          <div className="relative grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <Badge tone="onDark" className="mb-6">
                Built for greenhouses and high-value crops
              </Badge>

              <h1 className="font-display text-[2.5rem] font-semibold leading-[1.06] tracking-[-0.03em] text-balance lg:text-[3.25rem]">
                Know what your field needs,{" "}
                <span className="text-shoot">while it needs it.</span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-relaxed text-ink-invert/70">
                FarmFlow puts live sensor readings, weather, AI crop advice and
                verified agronomists on one screen — so decisions about water,
                shade and treatment are made on evidence rather than memory.
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-3">
                <Button asChild variant="signal" size="lg">
                  <Link href="/register">
                    Start with your first field
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  asChild
                  size="lg"
                  className="border border-white/20 bg-transparent text-ink-invert hover:bg-white/10"
                >
                  <Link href="/login">I already have an account</Link>
                </Button>
              </div>
            </div>

            <LiveReadout />
          </div>
        </div>
      </section>

      {/* ---------- the problem ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="mb-3 text-[0.6875rem] font-medium uppercase tracking-[0.16em] text-canopy">
              Why this exists
            </p>
            <h2 className="font-display text-3xl font-semibold leading-tight tracking-[-0.02em] text-balance lg:text-4xl">
              Good advice reaches farmers too late to use.
            </h2>
          </div>

          <div className="space-y-6">
            <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
              Bangladesh runs roughly{" "}
              <strong className="font-semibold text-ink">
                one agricultural extension officer for every 2,500 farmers
              </strong>
              . A question about a yellowing leaf waits days for an answer, and
              by then the answer has changed.
            </p>
            <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
              Meanwhile the conditions that caused it went unrecorded. Without
              measurement there is no way to tell a watering problem from a
              nutrient one, so the same mistake repeats next season.
            </p>
            <p className="text-[1.0625rem] leading-relaxed text-ink-soft">
              Controlled environments change that. In a greenhouse the
              variables are yours to set — which is exactly where continuous
              measurement pays for the hardware that produces it.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- how it works ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] lg:text-4xl">
          How it works
        </h2>
        <p className="mt-3 max-w-xl text-ink-soft">
          Four stages, in order. Each one hands something concrete to the next.
        </p>

        {/* Numbered because this genuinely is a sequence — a reading has to
            exist before it can be charted, charted before it can be advised on. */}
        <ol className="mt-10 grid gap-4 sm:grid-cols-2">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <li
                key={step.title}
                className="group rounded-card bg-surface p-7 card-shadow transition-transform duration-300 hover:-translate-y-1"
              >
                <div className="mb-5 flex items-center justify-between">
                  <span className="flex h-11 w-11 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
                    <Icon className="h-5 w-5" strokeWidth={1.75} />
                  </span>
                  <span className="tabular text-sm text-ink-faint">
                    0{i + 1}
                  </span>
                </div>
                <h3 className="font-display text-lg font-semibold tracking-tight">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-soft">
                  {step.body}
                </p>
              </li>
            );
          })}
        </ol>
      </section>

      {/* ---------- call to action ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-8">
        <div className="rounded-[2rem] bg-canopy px-8 py-14 text-center text-ink-invert lg:px-16">
          <h2 className="font-display text-3xl font-semibold tracking-[-0.02em] text-balance lg:text-[2.5rem]">
            Add a field. Watch it report back.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-ink-invert/75">
            Farmers monitor and control their own fields. Agronomists join as
            verified experts to answer what the AI hands over.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild variant="signal" size="lg">
              <Link href="/register">
                Create a farmer account
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              className="border border-white/25 bg-transparent text-ink-invert hover:bg-white/10"
            >
              <Link href="/register?role=expert">Join as an expert</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-line">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-8 text-sm text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <span className="font-display font-semibold text-ink-soft">FarmFlow</span>
          <span>Precision farming for controlled environments</span>
        </div>
      </footer>
    </div>
  );
}
