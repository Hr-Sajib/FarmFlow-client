"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAppSelector } from "@/redux/hooks"; // Your typed selector

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const token = useAppSelector((state) => state.auth.token);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Only redirect if not already on the login page
    if (!token && pathname !== "/login") {
      router.replace("/login");
    }
  }, [token, pathname, router]);

  // While redirecting, you can optionally return null or a loader
  if (!token && pathname !== "/login") {
    return null; // Prevent flashing protected content
  }

  return <>{children}</>;
}
