import type { Metadata } from "next";
import Link from "next/link";
import { RegisterFlow } from "./RegisterFlow";

export const metadata: Metadata = { title: "Create account" };

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ role?: string }>;
}) {
  const { role } = await searchParams;

  return (
    <>
      <RegisterFlow initialRole={role === "expert" ? "expert" : null} />

      <p className="mt-8 text-sm text-ink-soft">
        Already registered?{" "}
        <Link href="/login" className="font-medium text-canopy hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
