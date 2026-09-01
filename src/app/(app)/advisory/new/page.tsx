import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { serverFetch } from "@/lib/api";
import type { Field } from "@/lib/types";
import { NewSessionForm } from "./NewSessionForm";

export const metadata: Metadata = { title: "Ask a question" };

export default async function NewAdvisoryPage() {
  // Linking a field lets the advisor read its live sensor values and soil,
  // which is the difference between specific advice and generic advice.
  const fields = (await serverFetch<Field[]>("/field/myFields")) ?? [];

  return (
    <div className="mx-auto max-w-2xl px-6 py-8 lg:py-10">
      <Link
        href="/advisory"
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" />
        Advisory
      </Link>

      <h1 className="font-display text-2xl font-semibold tracking-tight">
        What are you seeing?
      </h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        Describe the problem in your own words. A photo of the affected plant
        helps more than anything else.
      </p>

      <NewSessionForm fields={fields} />
    </div>
  );
}
