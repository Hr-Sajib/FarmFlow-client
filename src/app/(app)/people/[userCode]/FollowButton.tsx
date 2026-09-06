"use client";

import { useState } from "react";
import { Loader2, UserMinus, UserPlus } from "lucide-react";
import { toast } from "sonner";

import { API_BASE } from "@/lib/config";
import { Button } from "@/components/ui/Button";

export function FollowButton({
  userCode,
  initiallyFollowing,
  onCountChange,
}: {
  userCode: string;
  initiallyFollowing: boolean;
  onCountChange: (delta: number) => void;
}) {
  const [following, setFollowing] = useState(initiallyFollowing);
  const [busy, setBusy] = useState(false);

  const toggle = async () => {
    const next = !following;
    // Moved first, reverted on failure: the button is the whole interaction,
    // and waiting a round trip to show it makes following feel broken.
    setFollowing(next);
    onCountChange(next ? 1 : -1);
    setBusy(true);

    try {
      const res = await fetch(`${API_BASE}/people/${userCode}/follow`, {
        method: next ? "POST" : "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error((await res.json())?.message ?? "Failed");
    } catch (error) {
      setFollowing(!next);
      onCountChange(next ? -1 : 1);
      toast.error(error instanceof Error ? error.message : "Could not update");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Button
      variant={following ? "outline" : "primary"}
      onClick={toggle}
      disabled={busy}
    >
      {busy ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : following ? (
        <UserMinus className="h-4 w-4" />
      ) : (
        <UserPlus className="h-4 w-4" />
      )}
      {following ? "Following" : "Follow"}
    </Button>
  );
}
