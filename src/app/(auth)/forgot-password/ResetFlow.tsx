"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input, FormField } from "@/components/ui/Field";
import { forgotPassword, verifyResetCode, resetPassword } from "@/lib/session";

type Stage = "email" | "code" | "password";

/**
 * Three stages, matching the API: request a code, exchange it for a
 * short-lived reset token, then set the new password with that token.
 *
 * The code is never re-sent in the final step — the token from stage two is
 * what authorises it, so a code cannot be replayed.
 */
export function ResetFlow() {
  const router = useRouter();
  const [stage, setStage] = useState<Stage>("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await forgotPassword(email.trim().toLowerCase());
      // The API answers identically whether or not the address is registered,
      // so this screen must not imply the account exists.
      setStage("code");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  };

  const submitCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { resetToken: token } = await verifyResetCode(
        email.trim().toLowerCase(),
        code.trim()
      );
      setResetToken(token);
      setStage("password");
    } catch (err) {
      setError(err instanceof Error ? err.message : "That code didn't work");
    } finally {
      setBusy(false);
    }
  };

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await resetPassword(resetToken, password);
      toast.success("Password changed. Sign in with the new one.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not set the password");
      setBusy(false);
    }
  };

  if (stage === "email") {
    return (
      <>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Reset your password
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Enter your email and we&apos;ll send a five-digit code.
        </p>

        <form onSubmit={submitEmail} className="mt-8 space-y-4">
          <FormField label="Email" error={error ?? undefined}>
            <Input
              type="email"
              autoComplete="email"
              placeholder="you@farm.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </FormField>
          <Button type="submit" size="lg" disabled={busy} className="w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Send the code
          </Button>
        </form>
      </>
    );
  }

  if (stage === "code") {
    return (
      <>
        <button
          type="button"
          onClick={() => setStage("email")}
          className="mb-5 inline-flex items-center gap-1.5 text-xs text-ink-soft hover:text-ink"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Use a different email
        </button>

        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
          <MailCheck className="h-5 w-5" strokeWidth={1.9} />
        </span>

        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Check your email
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          If <span className="font-medium text-ink">{email}</span> is registered,
          a five-digit code is on its way. It expires in 10 minutes.
        </p>

        <form onSubmit={submitCode} className="mt-8 space-y-4">
          <FormField label="Code" error={error ?? undefined}>
            <Input
              inputMode="numeric"
              autoComplete="one-time-code"
              placeholder="00000"
              maxLength={5}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
              className="tabular text-center text-lg tracking-[0.4em]"
              required
            />
          </FormField>
          <Button type="submit" size="lg" disabled={busy || code.length !== 5} className="w-full">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Verify code
          </Button>
        </form>
      </>
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl font-semibold tracking-tight">
        Set a new password
      </h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        You&apos;ll be signed out everywhere else.
      </p>

      <form onSubmit={submitPassword} className="mt-8 space-y-4">
        <FormField label="New password" hint="At least 6 characters" error={error ?? undefined}>
          <Input
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        </FormField>
        <Button type="submit" size="lg" disabled={busy || password.length < 6} className="w-full">
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Change password
        </Button>
      </form>
    </>
  );
}
