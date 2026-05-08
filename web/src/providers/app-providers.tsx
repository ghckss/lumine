"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { setApiAccessToken } from "@/shared/lib/api";
import { BridgeBootstrapProvider, useBridgeBootstrap } from "@/shared/hooks/useBridgeBootstrap";

declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (message: string) => void;
    };
  }
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  const [a, setA] = useState<number>();

  useEffect(() => { setA(Date.now()) }, [])

  return (
    <QueryClientProvider client={queryClient}>
      <BridgeBootstrapProvider>
        {a}
        <BridgeRouteReadySync />
        <BridgeNavigationSync />
        <BootstrapSessionSync>{children}</BootstrapSessionSync>
      </BridgeBootstrapProvider>
    </QueryClientProvider>
  );
}

function BridgeRouteReadySync() {
  const pathname = usePathname();

  useEffect(() => {
    if (!window.ReactNativeWebView) {
      return;
    }

    window.ReactNativeWebView.postMessage(JSON.stringify({
      type: "webToApp",
      payload: {
        requestId: `navigation.ready:${Date.now()}`,
        command: "navigation.ready",
        params: { pathname }
      }
    }));
  }, [pathname]);

  return null;
}

function BridgeNavigationSync() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    function handleCustomEvent(event: Event) {
      const customEvent = event as CustomEvent;
      const payload = customEvent.detail as { command?: string; params?: Record<string, unknown> } | undefined;

      if (payload?.command !== "navigation.navigate") {
        return;
      }

      const href = typeof payload.params?.href === "string" ? payload.params.href : null;
      if (!href || !href.startsWith("/") || href.startsWith("//") || href === pathname) {
        return;
      }

      router.push(href);
    }

    window.addEventListener("appToWeb", handleCustomEvent);
    return () => {
      window.removeEventListener("appToWeb", handleCustomEvent);
    };
  }, [pathname, router]);

  return null;
}

function BootstrapSessionSync({ children }: { children: React.ReactNode }) {
  const bootstrap = useBridgeBootstrap();

  useEffect(() => {
    setApiAccessToken(bootstrap.mode === "authenticated" ? bootstrap.accessToken : null);
  }, [bootstrap.accessToken, bootstrap.mode]);

  return <>{children}</>;
}
