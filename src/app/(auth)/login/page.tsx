import type { Metadata } from "next";
import Link from "next/link";
import { LoginForm } from "./LoginForm";
import { DemoLogin } from "./DemoLogin";

export const metadata: Metadata = { title: "Sign in" };

/** Server component; only the form itself is interactive. */
export default function LoginPage() {
  return (
    <>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Sign in
      </h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        Welcome back. Your fields are still reporting.
      </p>

      <LoginForm />

      <DemoLogin />

      <p className="mt-8 text-sm text-ink-soft">
        No account yet?{" "}
        <Link href="/register" className="font-medium text-canopy hover:underline">
          Create one
        </Link>
      </p>
    </>
  );
}
