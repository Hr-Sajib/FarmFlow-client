'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/redux/hooks";


interface Props {
  children: React.ReactNode;
}

const PrivateRoute = ({ children }: Props) => {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  useEffect(() => {
    if (!isLoggedIn) {
      router.replace("/login"); // redirect to login if not authenticated
    }
  }, [isLoggedIn, router]);

  // Avoid flicker: don't show children until auth status is known
  if (!isLoggedIn) return null;

  return <>{children}</>;
};

export default PrivateRoute;
