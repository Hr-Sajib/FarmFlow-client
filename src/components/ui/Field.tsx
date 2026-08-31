"use client";

import { forwardRef } from "react";
import { cn } from "@/lib/utils";

const base =
  "w-full rounded-tile border bg-surface px-4 py-3 text-sm text-ink " +
  "placeholder:text-ink-faint transition-colors duration-200 " +
  "focus:border-canopy focus:outline-none focus:ring-2 focus:ring-canopy/15";

export const Input = forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }
>(function Input({ className, invalid, ...props }, ref) {
  return (
    <input
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(base, invalid ? "border-alert" : "border-line", className)}
      {...props}
    />
  );
});

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(function Textarea({ className, invalid, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(base, "resize-y", invalid ? "border-alert" : "border-line", className)}
      {...props}
    />
  );
});

export function Label({
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-1.5 block text-xs font-medium text-ink-soft", className)}
      {...props}
    />
  );
}

/** Errors sit under the control and say what to do, not just what failed. */
export function FieldError({ children }: { children?: React.ReactNode }) {
  if (!children) return null;
  return <p className="mt-1.5 text-xs text-alert">{children}</p>;
}

export function FormField({
  label,
  error,
  hint,
  children,
}: {
  label: string;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
      {hint && !error ? (
        <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>
      ) : null}
      <FieldError>{error}</FieldError>
    </div>
  );
}
