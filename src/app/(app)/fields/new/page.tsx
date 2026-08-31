import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { NewFieldForm } from "./NewFieldForm";

export const metadata: Metadata = { title: "Add field" };

export default function NewFieldPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-8 lg:py-10">
      <Link
        href="/dashboard"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to dashboard
      </Link>

      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Add a field
      </h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        Location matters — weather and soil data are pulled from these
        coordinates.
      </p>

      <NewFieldForm />
    </div>
  );
}
