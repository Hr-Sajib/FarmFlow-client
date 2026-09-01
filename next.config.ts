import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
     * Next refuses to optimise images that resolve to a loopback address — an
     * SSRF guard. In development the API is on localhost, so the guard is
     * relaxed there only; production serves uploads from a real host and keeps
     * the protection.
     */
    dangerouslyAllowLocalIP: process.env.NODE_ENV === "development",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "i.postimg.cc",
        pathname: "/**", // logo in Navbar
      },
      {
        protocol: "https",
        hostname: "api.empowernextgenbd.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**", // legacy uploads
      },
      {
        // Uploads are served through the API, which redirects to a short-lived
        // signed S3 URL — the bucket itself stays private.
        protocol: "http",
        hostname: "localhost",
        port: "5002",
        pathname: "/upload/file/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.*.amazonaws.com",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
