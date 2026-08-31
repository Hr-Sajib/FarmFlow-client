import { cookies } from "next/headers";

export { API_BASE } from "@/lib/config";
import { API_BASE } from "@/lib/config";

type ApiEnvelope<T> = {
  success: boolean;
  message: string;
  data: T;
};

/**
 * Server-side fetch.
 *
 * Forwards the httpOnly auth cookie so pages can render with real data on the
 * server instead of shipping a loading state and fetching after hydration.
 * Returns null on 401 rather than throwing, so a layout can redirect instead
 * of surfacing an error boundary.
 */
export async function serverFetch<T>(
  path: string,
  init: RequestInit & { revalidate?: number } = {}
): Promise<T | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;

  const { revalidate, ...rest } = init;

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Cookie: `accessToken=${token}` } : {}),
        ...rest.headers,
      },
      // Telemetry and forum content change constantly; caching them would show
      // stale readings. Callers opt in to caching by passing `revalidate`.
      cache: revalidate ? "force-cache" : "no-store",
      ...(revalidate ? { next: { revalidate } } : {}),
    });

    if (!response.ok) return null;

    const body = (await response.json()) as ApiEnvelope<T>;
    return body.data;
  } catch {
    // A backend that is down should render an empty state, not crash the page.
    return null;
  }
}

/** True when a valid session cookie is present — used by layouts to gate. */
export async function hasSession(): Promise<boolean> {
  const cookieStore = await cookies();
  return Boolean(cookieStore.get("accessToken")?.value);
}
