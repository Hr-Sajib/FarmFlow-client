import Link from "next/link";
import { redirect } from "next/navigation";

import { hasSession } from "@/lib/api";
import { ContourField } from "@/components/marketing/ContourField";

/**
 * Server component: an already-signed-in visitor is redirected before any auth
 * markup is sent, rather than seeing the form flash and then bounce.
 */
export default async function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await hasSession()) redirect("/dashboard");

  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      {/* form side */}
      <div className="flex flex-col px-6 py-8 lg:px-14">
        <Link
          href="/"
          className="font-display text-lg font-semibold tracking-tight"
        >
          Farm<span className="text-canopy">Flow</span>
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-sm">{children}</div>
        </div>
      </div>

      {/* brand side */}
      <div className="relative hidden overflow-hidden bg-bark p-14 lg:flex lg:flex-col lg:justify-end">
        <ContourField className="pointer-events-none absolute inset-0 h-full w-full text-shoot/20" />
        <div className="relative max-w-sm">
          <p className="font-display text-[2rem] font-semibold leading-tight tracking-[-0.02em] text-ink-invert text-balance">
            Every reading, from every field, in one place.
          </p>
          <p className="mt-4 text-sm leading-relaxed text-ink-invert/60">
            Temperature, humidity, soil moisture and light — recorded
            continuously, charted over time, and read by an advisor that
            answers in your language.
          </p>
        </div>
      </div>
    </div>
  );
}
