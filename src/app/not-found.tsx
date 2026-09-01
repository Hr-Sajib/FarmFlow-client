import Link from "next/link";
import { Button } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6">
      <div className="max-w-sm text-center">
        <p className="font-display text-5xl font-semibold tracking-tight text-canopy">
          404
        </p>
        <h1 className="mt-3 font-display text-xl font-semibold tracking-tight">
          Nothing here
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">
          This page doesn&apos;t exist, or the field or conversation it pointed
          to has been removed.
        </p>
        <Button asChild className="mt-6">
          <Link href="/dashboard">Back to your dashboard</Link>
        </Button>
      </div>
    </div>
  );
}
