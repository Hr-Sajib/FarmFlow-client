"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { API_BASE } from "@/lib/config";
import { Button } from "@/components/ui/Button";
import { Input, FormField } from "@/components/ui/Field";

export function ChangePassword() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [oldPassword, setOld] = useState("");
  const [newPassword, setNew] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/auth/change-password`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const body = await res.json().catch(() => null);
      if (!res.ok) throw new Error(body?.message ?? "Could not change the password");

      // The server clears the session, so the next screen must be sign-in.
      toast.success("Password changed. Sign in again.");
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not change the password");
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <Button variant="outline" size="sm" className="mt-4" onClick={() => setOpen(true)}>
        <KeyRound className="h-4 w-4" />
        Change password
      </Button>
    );
  }

  return (
    <form onSubmit={submit} className="mt-4 space-y-3 rounded-tile bg-surface-sunk p-4">
      <FormField label="Current password">
        <Input
          type="password"
          autoComplete="current-password"
          value={oldPassword}
          onChange={(e) => setOld(e.target.value)}
          required
        />
      </FormField>
      <FormField label="New password" hint="At least 6 characters" error={error ?? undefined}>
        <Input
          type="password"
          autoComplete="new-password"
          value={newPassword}
          onChange={(e) => setNew(e.target.value)}
          minLength={6}
          required
        />
      </FormField>
      <p className="text-xs text-ink-faint">
        You&apos;ll be signed out on every device.
      </p>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={busy || newPassword.length < 6}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Change it
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
