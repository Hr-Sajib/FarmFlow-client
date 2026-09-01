"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { apiCall } from "@/lib/session";
import { Button } from "@/components/ui/Button";
import { Input, FormField } from "@/components/ui/Field";
import type { User } from "@/lib/types";

const schema = z.object({
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email("That doesn't look like an email"),
  address: z.string().min(2, "Enter where you're based"),
  phone: z
    .string()
    .regex(/^01[0-9]{9}$/, "Use an 11-digit number starting 01")
    .optional()
    .or(z.literal("")),
});

type Values = z.infer<typeof schema>;

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: user.fullName,
      email: user.email,
      address: user.address,
      phone: user.phone ?? "",
    },
  });

  const onSubmit = async (values: Values) => {
    setSaving(true);
    try {
      // Only fields this role may change are sent; the server rejects the rest
      // outright rather than ignoring them.
      await apiCall(`/user/${user._id}`, "PATCH", {
        fullName: values.fullName,
        email: values.email,
        address: values.address,
        ...(values.phone ? { phone: values.phone } : {}),
      });
      toast.success("Profile updated");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not save changes");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-card bg-surface p-5 card-shadow">
      <h2 className="font-display text-base font-semibold">Your details</h2>

      <div className="mt-5 space-y-4">
        <FormField label="Full name" error={errors.fullName?.message}>
          <Input invalid={Boolean(errors.fullName)} {...register("fullName")} />
        </FormField>
        <FormField label="Email" error={errors.email?.message}>
          <Input type="email" invalid={Boolean(errors.email)} {...register("email")} />
        </FormField>
        <FormField label="Where you're based" error={errors.address?.message}>
          <Input invalid={Boolean(errors.address)} {...register("address")} />
        </FormField>
        <FormField label="Phone" hint="Optional" error={errors.phone?.message}>
          <Input inputMode="numeric" invalid={Boolean(errors.phone)} {...register("phone")} />
        </FormField>
      </div>

      <Button type="submit" disabled={saving || !isDirty} className="mt-5">
        {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Save changes
      </Button>
    </form>
  );
}
