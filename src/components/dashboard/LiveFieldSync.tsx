"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";

import { API_BASE } from "@/lib/config";

/**
 * Keeps the server-rendered dashboard current.
 *
 * The cards already carry real values from the server, so this island only has
 * to notice change. Rather than duplicating card state on the client, it asks
 * Next to re-render the server component — one source of truth, and the same
 * code path whether a reading arrives now or on first load.
 *
 * Refreshes are throttled: a farm with several nodes can produce readings
 * every few seconds, and re-rendering that often would be wasteful and visibly
 * busy.
 */
const REFRESH_INTERVAL_MS = 15_000;

export function LiveFieldSync() {
  const router = useRouter();
  const lastRefresh = useRef(0);

  useEffect(() => {
    let socket: Socket | null = null;
    let cancelled = false;

    // The auth cookie is httpOnly, so the handshake token comes from a short
    // server round-trip rather than from document.cookie. The cancelled flag
    // covers an effect torn down while that request is still in flight.
    const connect = async () => {
      const res = await fetch("/api/socket-token", { credentials: "include" });
      if (!res.ok || cancelled) return;
      const { token } = (await res.json()) as { token: string | null };
      if (!token || cancelled) return;

      socket = io(`${API_BASE}/telemetry`, { auth: { token } });

      socket.on("connect", () => socket?.emit("telemetry:watch", {}));

      socket.on("telemetry:update", () => {
        const now = Date.now();
        if (now - lastRefresh.current < REFRESH_INTERVAL_MS) return;
        lastRefresh.current = now;
        router.refresh();
      });
    };

    void connect();

    return () => {
      cancelled = true;
      socket?.disconnect();
    };
  }, [router]);

  return null;
}
