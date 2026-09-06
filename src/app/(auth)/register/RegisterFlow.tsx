"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, ArrowRight, Loader2, Sprout, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input, FormField } from "@/components/ui/Field";
import { login, registerUser } from "@/lib/session";
import { AutoHeight } from "@/components/ui/AutoHeight";

type Role = "farmer" | "expert";

const schema = z
  .object({
    fullName: z.string().min(2, "Enter your full name"),
    email: z.string().min(1, "Enter your email").email("That doesn't look like an email"),
    password: z.string().min(6, "Use at least 6 characters"),
    address: z.string().min(2, "Enter where you're based"),
    phone: z
      .string()
      .regex(/^01[0-9]{9}$/, "Use an 11-digit number starting 01")
      .optional()
      .or(z.literal("")),
  });

type Values = z.infer<typeof schema>;

/**
 * Role is chosen before the form so the fields shown match the account being
 * made. Farmers are the overwhelming majority, so that path is presented as
 * the primary one rather than as an equal-weight pair.
 */
export function RegisterFlow({ initialRole }: { initialRole: Role | null }) {
  const router = useRouter();
  const [role, setRole] = useState<Role | null>(initialRole);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  // Choosing a role swaps a short picker for a long form. Animating the
  // height keeps that as one panel growing rather than two screens.
  const content = () => {
    if (!role) {
      return (
      <>
        <h1 className="font-display text-2xl font-semibold tracking-tight">
          Create your account
        </h1>
        <p className="mt-1.5 text-sm text-ink-soft">
          Which describes you?
        </p>

        <div className="mt-8 space-y-3">
          {/* Primary path — visually dominant. */}
          <button
            type="button"
            onClick={() => setRole("farmer")}
            className="group w-full rounded-card bg-canopy p-6 text-left text-ink-invert transition-transform duration-200 hover:-translate-y-0.5 card-shadow"
          >
            <div className="flex items-start gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-tile bg-shoot text-ink">
                <Sprout className="h-5 w-5" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-semibold">I grow crops</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-invert/70">
                  Monitor your fields, control irrigation and shade, and get
                  advice on what you're seeing.
                </p>
              </div>
              <ArrowRight className="mt-1 h-5 w-5 shrink-0 transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </button>

          {/* Secondary path — deliberately quieter. */}
          <button
            type="button"
            onClick={() => setRole("expert")}
            className="group w-full rounded-card border border-line bg-surface p-5 text-left transition-colors duration-200 hover:border-canopy"
          >
            <div className="flex items-center gap-4">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-tile bg-canopy-tint text-canopy">
                <Stethoscope className="h-4 w-4" strokeWidth={1.9} />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold">I'm an agricultural expert</p>
                <p className="mt-0.5 text-xs text-ink-soft">
                  Answer questions the AI hands over. Needs verification.
                </p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-ink-faint transition-transform duration-200 group-hover:translate-x-1" />
            </div>
          </button>
        </div>
      </>
    );
  }

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    try {
      const payload: Record<string, unknown> = {
        fullName: values.fullName,
        email: values.email,
        password: values.password,
        address: values.address,
        role,
      };
      if (values.phone) payload.phone = values.phone;
      await registerUser(payload);
      // Sign in immediately — asking someone to retype what they just entered
      // is friction with no purpose.
      await login(values.email, values.password);
      toast.success("Account created");
      router.refresh();
      router.push(role === "expert" ? "/profile?verify=1" : "/fields");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not create account");
      setSubmitting(false);
    }
  };

    return (
      <>
      <button
        type="button"
        onClick={() => setRole(null)}
        className="mb-5 inline-flex items-center gap-1.5 text-xs text-ink-soft transition-colors hover:text-ink"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Change account type
      </button>

      <h1 className="font-display text-2xl font-semibold tracking-tight">
        {role === "farmer" ? "Set up your farm account" : "Apply as an expert"}
      </h1>
      <p className="mt-1.5 text-sm text-ink-soft">
        {role === "farmer"
          ? "You can add your first field straight after this."
          : "An admin reviews your credentials before you start answering."}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-4">
        <FormField label="Full name" error={errors.fullName?.message}>
          <Input placeholder="Rahim Uddin" invalid={Boolean(errors.fullName)} {...register("fullName")} />
        </FormField>

        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" autoComplete="email" placeholder="you@farm.com" invalid={Boolean(errors.email)} {...register("email")} />
        </FormField>

        <FormField label="Password" error={errors.password?.message}>
          <Input type="password" autoComplete="new-password" placeholder="At least 6 characters" invalid={Boolean(errors.password)} {...register("password")} />
        </FormField>

        <FormField label="Where are you based?" error={errors.address?.message}>
          <Input placeholder="Savar, Dhaka" invalid={Boolean(errors.address)} {...register("address")} />
        </FormField>

        <FormField label="Phone" hint="Optional" error={errors.phone?.message}>
          <Input inputMode="numeric" placeholder="01712345678" invalid={Boolean(errors.phone)} {...register("phone")} />
        </FormField>

        {role === "expert" ? (
          <div className="space-y-4 rounded-tile bg-surface-sunk p-4">
            {/* Credentials are not collected here. A designation is only
                reviewable with its supporting documents attached, and uploading
                requires a session that does not exist yet during registration —
                so the whole credential is entered from the profile instead of
                being split across two steps. */}
            <p className="text-xs font-medium text-ink-soft">
              Add your credentials after signing in
            </p>
            <p className="text-xs leading-relaxed text-ink-faint">
              You&apos;ll enter each designation with its certificate or
              appointment letter attached, and an admin reviews it before you
              can take escalated questions.
            </p>
          </div>
        ) : null}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Creating account
            </>
          ) : (
            "Create account"
          )}
        </Button>
      </form>
    </>
  );
  };

  return <AutoHeight>{content()}</AutoHeight>;
}
