"use client";

import { Toaster } from "sonner";

/**
 * The only client boundary above the page tree. Everything else stays a server
 * component unless it needs interactivity of its own.
 */
export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "var(--color-surface)",
            color: "var(--color-ink)",
            border: "1px solid var(--color-line)",
            borderRadius: "var(--radius-tile)",
            fontFamily: "var(--font-sans)",
          },
        }}
      />
    </>
  );
}
