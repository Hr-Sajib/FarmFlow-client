import type { Metadata } from "next";
import Link from "next/link";
import { ResetFlow } from "./ResetFlow";

export const metadata: Metadata = { title: "Reset password" };

export default function ForgotPasswordPage() {
  return (
    <>
      <ResetFlow />
      <p className="mt-8 text-sm text-ink-soft">
        Remembered it?{" "}
        <Link href="/login" className="font-medium text-canopy hover:underline">
          Sign in
        </Link>
      </p>
    </>
  );
}
