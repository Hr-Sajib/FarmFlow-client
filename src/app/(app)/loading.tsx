/** Skeleton shaped like the page that follows, so the layout doesn't jump. */
export default function AppLoading() {
  return (
    <div className="px-6 py-8 lg:px-10 lg:py-10">
      <div className="mb-8 space-y-2">
        <div className="h-8 w-56 animate-pulse rounded-pill bg-surface-sunk" />
        <div className="h-4 w-36 animate-pulse rounded-pill bg-surface-sunk" />
      </div>
      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-72 animate-pulse rounded-card bg-surface-sunk" />
        ))}
      </div>
    </div>
  );
}
