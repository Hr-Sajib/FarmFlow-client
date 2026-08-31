"use client";

import { API_BASE } from "@/lib/config";

/**
 * Auth calls run from the browser rather than through a Server Action so the
 * backend's Set-Cookie reaches the browser directly. The client and API share
 * a site (ports are not part of a cookie's site), so the SameSite=Lax cookie
 * is accepted without loosening it to None.
 */
async function post<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.message ?? "Something went wrong. Please try again.");
  }
  return payload?.data as T;
}

export const login = (email: string, password: string) =>
  post<{ accessToken: string }>("/auth/login", { email, password });

export const registerUser = (payload: Record<string, unknown>) =>
  post("/user/register", payload);

export const forgotPassword = (email: string) =>
  post("/auth/forgot-password", { email });

export const verifyResetCode = (email: string, code: string) =>
  post<{ resetToken: string }>("/auth/verify-reset-code", { email, code });

export const resetPassword = (resetToken: string, newPassword: string) =>
  post("/auth/reset-password", { resetToken, newPassword });

export async function logout() {
  await fetch(`${API_BASE}/auth/logout`, {
    method: "POST",
    credentials: "include",
  });
}

/** Uploads through the backend, which signs and stores in S3. */
export async function uploadFiles(
  files: File[],
  category: "profile" | "fields" | "posts" | "advisory" | "documents"
): Promise<Array<{ url: string; key: string; fileType: string }>> {
  const body = new FormData();
  files.forEach((file) => body.append("files", file));
  body.append("category", category);

  const response = await fetch(`${API_BASE}/upload`, {
    method: "POST",
    credentials: "include",
    body,
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message ?? "Upload failed");
  }
  return payload.data;
}

/** Authenticated JSON call from the browser (mutations that are not auth). */
export async function apiCall<T>(
  path: string,
  method: "POST" | "PATCH" | "DELETE",
  body?: unknown
): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(payload?.message ?? "Request failed");
  }
  return payload?.data as T;
}
