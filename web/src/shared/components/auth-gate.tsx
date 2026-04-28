"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/shared/store/auth-store";

const publicRoutes = new Set(["/auth/login", "/auth/signup"]);

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    const isPublicRoute = pathname ? publicRoutes.has(pathname) : false;

    if (!isAuthenticated && !isPublicRoute) {
      router.replace("/auth/login");
      return;
    }

    if (isAuthenticated && pathname === "/auth/login") {
      router.replace("/");
    }
  }, [isAuthenticated, isHydrated, pathname, router]);

  if (!isHydrated) {
    return null;
  }

  if (!isAuthenticated && pathname && !publicRoutes.has(pathname)) {
    return null;
  }

  return <>{children}</>;
}
