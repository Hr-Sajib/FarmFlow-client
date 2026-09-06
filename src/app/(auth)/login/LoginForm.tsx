"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/Button";
import { Input, FormField } from "@/components/ui/Field";
import { login } from "@/lib/session";

const schema = z.object({
  email: z.string().min(1, "Enter your email").email("That doesn't look like an email"),
  password: z.string().min(1, "Enter your password"),
});

type Values = z.infer<typeof schema>;

export function LoginForm() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: Values) => {
    setSubmitting(true);
    try {
      await login(values.email, values.password);
      // Refresh so server components re-render with the new session cookie.
      router.refresh();
      router.push("/overview");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Sign in failed");
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mt-8 space-y-4">
      <FormField label="Email" error={errors.email?.message}>
        <Input
          type="email"
          autoComplete="email"
          placeholder="you@farm.com"
          invalid={Boolean(errors.email)}
          {...register("email")}
        />
      </FormField>

      <div>
        <div className="mb-1.5 flex items-baseline justify-between">
          <span className="text-xs font-medium text-ink-soft">Password</span>
          <Link
            href="/forgot-password"
            className="text-xs text-canopy hover:underline"
          >
            Forgot it?
          </Link>
        </div>
        <Input
          type="password"
          autoComplete="current-password"
          placeholder="••••••••"
          invalid={Boolean(errors.password)}
          {...register("password")}
        />
        {errors.password ? (
          <p className="mt-1.5 text-xs text-alert">{errors.password.message}</p>
        ) : null}
      </div>

      <Button type="submit" size="lg" disabled={submitting} className="w-full">
        {submitting ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Signing in
          </>
        ) : (
          "Sign in"
        )}
      </Button>
    </form>
  );
}
