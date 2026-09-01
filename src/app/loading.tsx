/** Shown while a server component streams. Shape mirrors the app shell. */
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex items-center gap-3 text-sm text-ink-soft">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-canopy border-t-transparent" />
        Loading
      </div>
    </div>
  );
}
