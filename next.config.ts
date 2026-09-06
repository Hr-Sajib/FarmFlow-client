import path from "path";
import type { NextConfig } from "next";

/**
 * The one bucket uploads live in. Named exactly rather than by wildcard, so a
 * bucket someone else owns cannot be routed through the optimizer.
 */
const s3Host =
  process.env.NEXT_PUBLIC_S3_HOST ?? "farmflow-bucket.s3.ap-south-1.amazonaws.com";

const nextConfig: NextConfig = {
  // Emits a self-contained server bundle, so the runtime image carries only
  // what the app actually imports instead of the whole node_modules tree.
  output: "standalone",
  /** The route was renamed to match the label it is reached by. */
  async redirects() {
    return [{ source: "/dashboard", destination: "/overview", permanent: false }];
  },
  /**
   * A verification build must not write into the directory a running dev
   * server is reading from — Turbopack shares `.next` between the two, and the
   * build replaces the dev chunks, which strips the stylesheet off every page
   * until dev is restarted. `npm run build:check` points somewhere else.
   */
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
  // Pin Turbopack's workspace root to this package. Without it, Next can infer
  // the parent directory as the root, which makes CSS resolution of
  // `@import "tailwindcss"` look in /Desktop/FarmFlow/node_modules (nonexistent)
  // instead of ./node_modules, failing with "Can't resolve 'tailwindcss'".
  turbopack: {
    root: path.resolve(__dirname),
  },
  images: {
    /**
     * Deliberately narrow. `/_next/image` is a public endpoint, so every host
     * listed here is a host any visitor can make this server fetch, decode and
     * cache on their behalf. Only the app's own S3 bucket is allowed; uploads
     * are served from it directly with public-read ACLs.
     */
    remotePatterns: [
      {
        protocol: "https" as const,
        hostname: s3Host,
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
